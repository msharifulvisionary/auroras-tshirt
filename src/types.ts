export type SleeveSize = 'S' | 'M' | 'L' | 'XL' | '2XL' | '3XL' | '4XL' | '5XL' | '6XL';

export interface Application {
  id: string;
  fullName: string;
  roll: string;
  whatsapp: string;
  backName: string;
  backNumber: string;
  size: SleeveSize;
  paymentMethod: 'CASH' | 'BIKASH';
  sleeve: 'HALF' | 'FULL';
  bkashSender: string;
  status: 'pending' | 'confirmed';
  createdAt: number;
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
  createdAt: number;
}

export interface Settings {
  demoImage: string;
  finalImage: string;
  priceHalf: number;
  priceFull: number;
  notice: string;
  deadline: number;
}

export const defaultSettings: Settings = {
  demoImage: "https://i.imgur.com/TgPmNub.jpeg",
  finalImage: "https://i.imgur.com/WhtMLsi.jpeg",
  priceHalf: 400,
  priceFull: 430,
  notice: "",
  deadline: 0,
};
