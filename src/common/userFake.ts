import { faker } from '@faker-js/faker/locale/af_ZA';
import * as XLSX from 'xlsx';

export class ExcelService {
    generateExcel(quantity: number): Buffer {
        let data = []

        for (let x = 1; x <= quantity; x++) {
            const user_name = faker.person.fullName();
            const user_email = faker.internet.email();
            const user_password = faker.internet.password();
            const user_profile_id = 2;
            const user_date_of_birth = faker.date.between('1970-01-01', '1999-12-31');

            const formattedDate = `${user_date_of_birth.getDate().toString().padStart(2, '0')}/${(user_date_of_birth.getMonth() + 1).toString().padStart(2, '0')}/${user_date_of_birth.getFullYear()}`;

            const res = {
                user_name,
                user_email,
                user_password,
                user_profile_id,
                user_date_of_birth: formattedDate
            }

            data.push(res);
        }

        const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

        // Escrever o arquivo em um buffer
        return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    }
}
