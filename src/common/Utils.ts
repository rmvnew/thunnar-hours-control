import { BadRequestException } from "@nestjs/common";
import * as bcrypt from 'bcrypt';
import { createCipheriv } from "crypto";
import { CpnjResponse } from "./interfaces/cnpj-response";



export class Utils {

    private static instance: Utils
    public static getInstance(): Utils {
        if (!Utils.instance) {
            Utils.instance = new Utils()
        }
        return Utils.instance
    }

    getCurrentDate(): string {

        let currentDate = new Date();
        let date = this.getFillNumber(currentDate.getDate())
        let month = this.getFillNumber((currentDate.getMonth() + 1))
        let year = currentDate.getFullYear();
        let hours = this.getFillNumber(currentDate.getHours());
        let minutes = this.getFillNumber(currentDate.getMinutes())
        let seconds = this.getFillNumber(currentDate.getSeconds())

        return `${date}/${month}/${year} ${hours}:${minutes}:${seconds}`

    }

    getFillNumber(value: number) {
        return `0${value}`.slice(-2)
    }

    getValidName(name: string) {

        let currentName = name.toUpperCase()

        currentName = currentName.replace(/\s+/g, " ")

        if (this.validateUser(/[!@#$%^&*(),.?":{}|<>]/g, currentName)) {
            throw new BadRequestException('O nome não pode conter caracteres especiais!!')
        }

        return currentName
    }

    private validateUser(regex: RegExp, value: string): boolean {
        return regex.test(value)
    }

    async encryptPassword(pass: string): Promise<string> {
        const saltOrRounds = 10;
        return bcrypt.hash(pass, saltOrRounds)

    }

    getFormatedUsDate(date: string) {

        const currentDate = date.split('/')
        const day = currentDate[0]
        const month = currentDate[1]
        const year = currentDate[2]
        return new Date(`${year}/${month}/${day}`)

    }

    getReadingDate(date: string) {

        console.log('Date: ', date);

        const day = date.substring(6)
        const month = date.substring(4, 6)
        const year = date.substring(0, 4)
        return new Date(`${year}/${month}/${day}`)

    }

    async encrypt(password: string): Promise<string> {
        const padSize = 16 - (((password.length + 16 - 1) % 16) + 1)
        const data = String.fromCharCode(padSize)
        const cipher = createCipheriv('aes-128-cbc', 'G!P@4#1$1%M4SC4D', 'C#&UjO){QwzFcsPs')
        cipher.setAutoPadding(false)
        let pass = password + data.repeat(padSize)
        let enc = cipher.update(pass, 'utf8', 'base64')
        return (enc += cipher.final('base64'))
    }


    async compareObjects(first: any, second: any) {

        let fistObject = Object.getOwnPropertyNames(first)
        let secondObject = Object.getOwnPropertyNames(second)

        if (fistObject.length != secondObject.length) {
            return false
        }

        for (const element of fistObject) {

            let propName = element

            if (first[propName] !== second[propName]) {
                return false
            }
        }

        return true
    }


    getEnrollmentCode() {


        const currentdate = new Date()
        const year = currentdate.getFullYear()
        const month = (currentdate.getMonth() + 1).toString().padStart(2, '0')
        const day = currentdate.getDate().toString().padStart(2, '0')

        const minNumber = 100000;
        const maxNumber = 999999;

        const randomNumber = Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;

        return `${year}-${month}-${day}${randomNumber}`

    }


    generatePassword(): string {
        const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';
        const specialChars = '!@#$%^&*()_-+=<>?';

        let password = '';

        // Gerar duas letras maiúsculas
        for (let i = 0; i < 2; i++) {
            const randomIndex = Math.floor(Math.random() * uppercaseChars.length);
            password += uppercaseChars[randomIndex];
        }

        // Gerar dois números
        for (let i = 0; i < 2; i++) {
            const randomIndex = Math.floor(Math.random() * numbers.length);
            password += numbers[randomIndex];
        }

        // Gerar um caractere especial
        const randomIndex = Math.floor(Math.random() * specialChars.length);
        password += specialChars[randomIndex];

        // Preencher até 8 caracteres, se necessário
        const allChars = uppercaseChars + numbers + specialChars;
        while (password.length < 8) {
            const randomIndex = Math.floor(Math.random() * allChars.length);
            password += allChars[randomIndex];
        }

        return password;
    }



    validateCPF(cpf: string): { cpf: string; isValid: boolean } {
        // Remover caracteres não numéricos
        const sanitizedCPF = cpf.replace(/[^\d]+/g, '');

        let isValid = true;

        if (sanitizedCPF.length !== 11) {
            isValid = false;
        }

        if (/^(\d)\1+$/.test(sanitizedCPF)) {
            isValid = false;
        }

        let sum = 0;
        let remainder;

        // Validar primeiro dígito verificador
        for (let i = 1; i <= 9; i++) {
            sum += parseInt(sanitizedCPF.substring(i - 1, i)) * (11 - i);
        }
        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(sanitizedCPF.substring(9, 10))) {
            isValid = false;
        }

        // Validar segundo dígito verificador
        sum = 0;
        for (let i = 1; i <= 10; i++) {
            sum += parseInt(sanitizedCPF.substring(i - 1, i)) * (12 - i);
        }
        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(sanitizedCPF.substring(10, 11))) {
            isValid = false;
        }

        return {
            cpf: sanitizedCPF,
            isValid,
        };
    }


    validateCNPJ(cnpj: string): CpnjResponse {
        // Remover caracteres não numéricos
        const sanitizedCNPJ = cnpj.replace(/[^\d]+/g, '');

        let isValid = true;

        if (sanitizedCNPJ.length !== 14) {
            isValid = false;
        }

        if (/^(\d)\1+$/.test(sanitizedCNPJ)) {
            isValid = false;
        }

        let sum = 0;
        let remainder;

        // Primeira parte da validação do CNPJ
        const multipliers1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        for (let i = 0; i < 12; i++) {
            sum += parseInt(sanitizedCNPJ.charAt(i)) * multipliers1[i];
        }
        remainder = sum % 11;
        if (remainder < 2) {
            remainder = 0;
        } else {
            remainder = 11 - remainder;
        }
        if (remainder !== parseInt(sanitizedCNPJ.charAt(12))) {
            isValid = false;
        }

        // Segunda parte da validação do CNPJ
        sum = 0;
        const multipliers2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        for (let i = 0; i < 13; i++) {
            sum += parseInt(sanitizedCNPJ.charAt(i)) * multipliers2[i];
        }
        remainder = sum % 11;
        if (remainder < 2) {
            remainder = 0;
        } else {
            remainder = 11 - remainder;
        }
        if (remainder !== parseInt(sanitizedCNPJ.charAt(13))) {
            isValid = false;
        }

        const result: CpnjResponse = {
            cnpj: sanitizedCNPJ,
            status: isValid,
        };

        return result
    }





}