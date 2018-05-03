(function () {
	'use strict';

	function format_jpy(price) {
		return price.toLocaleString('ja-JP') + ' 円';
	}

	function format_jpy_ppl(price) {
		let mark = '';
		if (price > 0) {
			mark = '+';
		}
		return mark + price.toLocaleString('ja-JP') + ' 円';
	}

	function format_usd(price) {
		return price.toLocaleString('en-US') + ' ＄';
	}

	function format_usd_ppl(price) {
		let mark = '';
		if (price > 0) {
			mark = '+';
		}
		return mark + price.toLocaleString('en-US') + ' ＄';
	}


	function unixTime2ymd(intTime, disp_day) {
		if (intTime === 0) {
			return '-';
		}
		var d = new Date(intTime * 1000);
		var year = d.getFullYear();
		var month = d.getMonth() + 1;
		var day = d.getDate();
		var hour = ('0' + d.getHours()).slice(-2);
		var min = ('0' + d.getMinutes()).slice(-2);
		var sec = ('0' + d.getSeconds()).slice(-2);

		if (disp_day) {
			return month + '/' + day + ' ' + hour + ':' + min;
		} else {
			return hour + ':' + min + ':' + sec;
		}
	}

	$(function () {

		let soundVol = 1.0;
		chrome.storage.local.get(['enableSound', 'soundVol', 'enableSFD'], function (value) {
			let enableSound = value.enableSound;
			if (enableSound) {
				$('#chkEnableSound').prop('checked', true);
			}
			let tmp_vol = value.soundVol;
			if (tmp_vol != null) {
				$('#selSoundVol').val((tmp_vol * 10).toString());
				soundVol = tmp_vol;
			}
			let enableSFD = value.enableSFD;
			if (enableSFD) {
				$('#chkEnableSFD').prop('checked', true);
			}
		});
		$('#chkEnableSFD').change(function () {
			if ($(this).is(':checked')) {
				chrome.storage.local.set({'enableSFD': true});
			} else {
				chrome.storage.local.set({'enableSFD': false});
			}
		});
		$('#chkEnableSound').change(function () {
			if ($(this).is(':checked')) {
				chrome.storage.local.set({'enableSound': true});
				var sound = new Audio('/sound/ding.ogg');
				sound.volume = soundVol;
				sound.play();
			} else {
				chrome.storage.local.set({'enableSound': false});
			}
		});
		$('#selSoundVol').change(function () {
			soundVol = parseInt($(this).val(), 10) / 10;
			chrome.storage.local.set({'soundVol': soundVol});
			chrome.storage.local.get('enableSound', function (value) {
				let enableSound = value.enableSound;
				if (enableSound) {
					var sound = new Audio('/sound/ding.ogg');
					sound.volume = soundVol;
					sound.play();
				}
			});
		});

		function main() {

			chrome.runtime.sendMessage({type: 'popup'}, function (response) {
				//	console.log(response);

				$('#bffx_td_last').text(format_jpy(response.bffxData.last));
				$('#bffx_td_high').text(format_jpy(response.bffxData.high));
				$('#bffx_td_low').text(format_jpy(response.bffxData.low));
				$('#bffx_td_side').text(response.bffxData.side);
				$('#bffx_td_sfd').text(response.bffxData.sfd1 + '％(SFD:' + response.bffxData.sfd2 + '％)');
				$('#bffx_td_time').text(response.bffxData.time);

				let bffx_size = response.bffxBotStatus.size;
				if (bffx_size % 1 === 0) {
					bffx_size = bffx_size.toString() + '.0';
				}
				$('#bffx_td_bot_size').text(bffx_size + ' btc' + ' (' + response.bffxBotStatus.leverage + '倍)');
				$('#bffx_td_bot_entry_price').text(format_jpy(response.bffxBotStatus.entry_price));
				$('#bffx_td_bot_ppl').text(format_jpy_ppl(response.bffxBotStatus.ppl + response.bffxBotStatus.now_ppl));
				$('#bffx_td_bot_now_ppl').text(format_jpy_ppl(response.bffxBotStatus.now_ppl));
				$('#bffx_td_bot_entry_time').text(unixTime2ymd(response.bffxBotStatus.entry_time, true));
				$('#bffx_td_bot_side').text(response.bffxBotStatus.side);
				$('#bffx_td_bot_debut_price').text(format_jpy(response.bffxBotStatus.debut_price));
				$('#bffx_td_bot_debut_time').text(unixTime2ymd(response.bffxBotStatus.debut_time, true));
				$('#bffx_td_bot_win_rate').text(response.bffxBotStatus.win_rate + ' ％');
				$('#bffx_td_bot_trade_cnt').text(response.bffxBotStatus.trade_cnt + ' 回目');
				$('#bffx_td_bot_funds').text(format_jpy(response.bffxBotStatus.funds));

				let bffx_funds_per = Math.floor(((response.bffxBotStatus.funds + response.bffxBotStatus.ppl + response.bffxBotStatus.now_ppl) / response.bffxBotStatus.funds) * 100);
				$('#bffx_td_bot_total_assets').text(format_jpy(response.bffxBotStatus.funds + response.bffxBotStatus.ppl + response.bffxBotStatus.now_ppl) + ' (' + bffx_funds_per + '％)');
				if (response.bffxBotStatus.now_ppl < 0) {
					$('#bffx_bot_icon').attr('src', '/img/omg.png');
				} else {
					$('#bffx_bot_icon').attr('src', '/img/smile.png');
				}

				$('#bf_td_last').text(format_jpy(response.bfData.last));
				$('#bf_td_high').text(format_jpy(response.bfData.high));
				$('#bf_td_low').text(format_jpy(response.bfData.low));
				$('#bf_td_side').text(response.bfData.side);
				$('#bf_td_time').text(response.bfData.time);

				$('#bfn_td_last').text(format_usd(response.bfnData.last));
				$('#bfn_td_high').text(format_usd(response.bfnData.high));
				$('#bfn_td_low').text(format_usd(response.bfnData.low));
				$('#bfn_td_side').text(response.bfnData.side);
				$('#bfn_td_time').text(response.bfnData.time);

				$('#bm_td_last').text(format_usd(response.bmData.last));
				$('#bm_td_high').text(format_usd(response.bmData.high));
				$('#bm_td_low').text(format_usd(response.bmData.low));
				$('#bm_td_side').text(response.bmData.side);
				$('#bm_td_time').text(response.bmData.time);

				let bm_size = response.bmBotStatus.size;
				if (bm_size % 1 === 0) {
					bm_size = bm_size.toString() + '.0';
				}
				$('#bm_td_bot_size').text(bm_size + ' btc' + ' (' + response.bmBotStatus.leverage + '倍)');
				$('#bm_td_bot_entry_price').text(format_usd(response.bmBotStatus.entry_price));
				$('#bm_td_bot_ppl').text(format_usd_ppl(response.bmBotStatus.ppl + response.bmBotStatus.now_ppl));
				$('#bm_td_bot_now_ppl').text(format_usd_ppl(response.bmBotStatus.now_ppl));
				$('#bm_td_bot_entry_time').text(unixTime2ymd(response.bmBotStatus.entry_time, true));
				$('#bm_td_bot_side').text(response.bmBotStatus.side);
				$('#bm_td_bot_debut_price').text(format_usd(response.bmBotStatus.debut_price));
				$('#bm_td_bot_debut_time').text(unixTime2ymd(response.bmBotStatus.debut_time, true));
				$('#bm_td_bot_win_rate').text(response.bmBotStatus.win_rate + ' ％');
				$('#bm_td_bot_trade_cnt').text(response.bmBotStatus.trade_cnt + ' 回目');
				$('#bm_td_bot_funds').text(format_usd(response.bmBotStatus.funds));

				let bm_funds_per = Math.floor(((response.bmBotStatus.funds + response.bmBotStatus.ppl + response.bmBotStatus.now_ppl) / response.bmBotStatus.funds) * 100);
				$('#bm_td_bot_total_assets').text(format_usd(response.bmBotStatus.funds + response.bmBotStatus.ppl + response.bmBotStatus.now_ppl) + ' (' + bm_funds_per + '％)');
				if (response.bmBotStatus.now_ppl < 0) {
					$('#bm_bot_icon').attr('src', '/img/omg.png');
				} else {
					$('#bm_bot_icon').attr('src', '/img/smile.png');
				}
			});
		}

		main();
		setInterval(main, 5 * 1000);
	});

}());
