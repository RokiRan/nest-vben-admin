export function getOddsData(oData: any, t: 'crs' | 'ttg' | 'hafu' | 'mnl' | 'hdc' | 'wnm' | 'hilo', tempHadObj: Record<string, string>) {

    switch (t) {
        case 'crs':
            tempHadObj['-1-a'] = oData.s1sa ? oData.s1sa : '';
            tempHadObj['-1-d'] = oData.s1sd ? oData.s1sd : '';
            tempHadObj['-1-h'] = oData.s1sh ? oData.s1sh : '';
            tempHadObj['0000'] = oData.s00s00 ? oData.s00s00 : '';
            tempHadObj['0001'] = oData.s00s01 ? oData.s00s01 : '';
            tempHadObj['0002'] = oData.s00s02 ? oData.s00s02 : '';
            tempHadObj['0003'] = oData.s00s03 ? oData.s00s03 : '';
            tempHadObj['0004'] = oData.s00s04 ? oData.s00s04 : '';
            tempHadObj['0005'] = oData.s00s05 ? oData.s00s05 : '';
            tempHadObj['0100'] = oData.s01s00 ? oData.s01s00 : '';
            tempHadObj['0101'] = oData.s01s01 ? oData.s01s01 : '';
            tempHadObj['0102'] = oData.s01s02 ? oData.s01s02 : '';
            tempHadObj['0103'] = oData.s01s03 ? oData.s01s03 : '';
            tempHadObj['0104'] = oData.s01s04 ? oData.s01s04 : '';
            tempHadObj['0105'] = oData.s01s05 ? oData.s01s05 : '';
            tempHadObj['0200'] = oData.s02s00 ? oData.s02s00 : '';
            tempHadObj['0201'] = oData.s02s01 ? oData.s02s01 : '';
            tempHadObj['0202'] = oData.s02s02 ? oData.s02s02 : '';
            tempHadObj['0203'] = oData.s02s03 ? oData.s02s03 : '';
            tempHadObj['0204'] = oData.s02s04 ? oData.s02s04 : '';
            tempHadObj['0205'] = oData.s02s05 ? oData.s02s05 : '';
            tempHadObj['0300'] = oData.s03s00 ? oData.s03s00 : '';
            tempHadObj['0301'] = oData.s03s01 ? oData.s03s01 : '';
            tempHadObj['0302'] = oData.s03s02 ? oData.s03s02 : '';
            tempHadObj['0303'] = oData.s03s03 ? oData.s03s03 : '';
            tempHadObj['0400'] = oData.s04s00 ? oData.s04s00 : '';
            tempHadObj['0401'] = oData.s04s01 ? oData.s04s01 : '';
            tempHadObj['0402'] = oData.s04s02 ? oData.s04s02 : '';
            tempHadObj['0500'] = oData.s05s00 ? oData.s05s00 : '';
            tempHadObj['0501'] = oData.s05s01 ? oData.s05s01 : '';
            tempHadObj['0502'] = oData.s05s02 ? oData.s05s02 : '';
            break;
        case 'ttg':
            tempHadObj['s0'] = oData.s0 ? oData.s0 : '';
            tempHadObj['s1'] = oData.s1 ? oData.s1 : '';
            tempHadObj['s2'] = oData.s2 ? oData.s2 : '';
            tempHadObj['s3'] = oData.s3 ? oData.s3 : '';
            tempHadObj['s4'] = oData.s4 ? oData.s4 : '';
            tempHadObj['s5'] = oData.s5 ? oData.s5 : '';
            tempHadObj['s6'] = oData.s6 ? oData.s6 : '';
            tempHadObj['s7'] = oData.s7 ? oData.s7 : '';
            break;
        case 'hafu':
            tempHadObj['aa'] = oData.aa ? oData.aa : '';
            tempHadObj['ad'] = oData.ad ? oData.ad : '';
            tempHadObj['ah'] = oData.ah ? oData.ah : '';
            tempHadObj['da'] = oData.da ? oData.da : '';
            tempHadObj['dd'] = oData.dd ? oData.dd : '';
            tempHadObj['dh'] = oData.dh ? oData.dh : '';
            tempHadObj['ha'] = oData.ha ? oData.ha : '';
            tempHadObj['hd'] = oData.hd ? oData.hd : '';
            tempHadObj['hh'] = oData.hh ? oData.hh : '';
            break;
        case 'mnl':
            tempHadObj['a'] = oData.a ? oData.a : '';
            tempHadObj['h'] = oData.h ? oData.h : '';
            tempHadObj['h_trend'] = oData.hf ? oData.hf : '';
            tempHadObj['a_trend'] = oData.af ? oData.af : '';
            break;
        case 'hdc':
            tempHadObj['a'] = oData.a ? oData.a : '';
            tempHadObj['h'] = oData.h ? oData.h : '';
            tempHadObj['h_trend'] = oData.hf ? oData.hf : '';
            tempHadObj['a_trend'] = oData.af ? oData.af : '';
            break;
        case 'wnm':
            tempHadObj['l1'] = oData.l1 ? oData.l1 : '';
            tempHadObj['l2'] = oData.l2 ? oData.l2 : '';
            tempHadObj['l3'] = oData.l3 ? oData.l3 : '';
            tempHadObj['l4'] = oData.l4 ? oData.l4 : '';
            tempHadObj['l5'] = oData.l5 ? oData.l5 : '';
            tempHadObj['l6'] = oData.l6 ? oData.l6 : '';
            tempHadObj['w1'] = oData.w1 ? oData.w1 : '';
            tempHadObj['w2'] = oData.w2 ? oData.w2 : '';
            tempHadObj['w3'] = oData.w3 ? oData.w3 : '';
            tempHadObj['w4'] = oData.w4 ? oData.w4 : '';
            tempHadObj['w5'] = oData.w5 ? oData.w5 : '';
            tempHadObj['w6'] = oData.w6 ? oData.w6 : '';
            break;
        case 'hilo':
            tempHadObj['l'] = oData.l ? oData.l : '';
            tempHadObj['h'] = oData.h ? oData.h : '';
            tempHadObj['h_trend'] = oData.hf ? oData.hf : '';
            tempHadObj['l_trend'] = oData.lf ? oData.lf : '';
            break;
        default:
            tempHadObj['a'] = oData.a ? oData.a : '';
            tempHadObj['d'] = oData.d ? oData.d : '';
            tempHadObj['h'] = oData.h ? oData.h : '';
            tempHadObj['h_trend'] = oData.hf ? oData.hf : '';
            tempHadObj['a_trend'] = oData.af ? oData.af : '';
            tempHadObj['d_trend'] = oData.df ? oData.df : '';
            break;
    }
    tempHadObj['fixedodds'] = oData.goalLine;

    return tempHadObj;
}