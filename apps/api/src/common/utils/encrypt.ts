import * as bcrypt from 'bcrypt';

export const hash = (str: string, saltRounds = 10) => bcrypt.hash(str, saltRounds);
export const compare = (str: string, hash: string) => bcrypt.compare(str, hash);
