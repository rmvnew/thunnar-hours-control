import { subHours } from 'date-fns';
import * as moment from 'moment-timezone';



export class CustomDate {
    private static instance: CustomDate;
    public static getInstance(): CustomDate {
        if (!CustomDate.instance) {
            CustomDate.instance = new CustomDate();
        }
        return CustomDate.instance;
    }


    newAmDate() {

        return moment().tz('America/Manaus').format('HH:mm');
    }


    customNewAmDate(time: string) {
        return moment(time).tz('America/Manaus').format('HH:mm');
    }


    newSPDate() {

        return moment().tz('America/Sao_Paulo').format()
    }

    getAMHours(hour: string) {
        return moment(hour).tz('America/Manaus').format()
    }

    getDateAmazonas() {
        const manausTimeOffset = 4; // Manaus está em GMT-4
        const nowInManaus = new Date(); // Data e hora atuais
        return subHours(nowInManaus, manausTimeOffset);
    }

}


