export type SleeveSize = 'S' | 'M' | 'L' | 'XL' | '2XL' | '3XL' | '4XL' | '5XL' | '6XL';

export interface PaymentMethodConfig {
  id: string;
  name: string;
  logo: string;
  number: string;
  qrImage: string;
  active: boolean;
}

export interface Application {
  id: string;
  fullName: string;
  roll: string;
  whatsapp: string;
  backName: string;
  backNumber: string;
  size: SleeveSize;
  paymentMethod: string;
  sleeve: 'HALF' | 'FULL';
  bkashSender: string;
  status: 'pending' | 'confirmed';
  createdAt: number;
  amountPaid?: number;
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
  paymentMethods?: PaymentMethodConfig[];
  adminWhatsapp?: string;
  isRegistrationActive?: boolean;
  registrationDisabledMessage?: string;
}

export interface StudentQuery {
  id: string;
  name: string;
  roll: string;
  message: string;
  timestamp: number;
  replied?: boolean;
}

export const defaultSettings: Settings = {
  demoImage: "https://i.imgur.com/TgPmNub.jpeg",
  finalImage: "https://i.imgur.com/WhtMLsi.jpeg",
  priceHalf: 400,
  priceFull: 430,
  notice: "",
  deadline: 0,
  adminWhatsapp: "017XXXXXXXX",
  isRegistrationActive: true,
  registrationDisabledMessage: "টি-শার্ট অর্ডার কার্যক্রম সাময়িকভাবে বন্ধ আছে। দয়া করে পরবর্তী নোটিশের জন্য অপেক্ষা করুন।",
  paymentMethods: [
    {
      id: "bikash",
      name: "bKash",
      logo: "https://logos-download.com/wp-content/uploads/2022/01/bKash_Logo.png",
      number: "017XXXXXXXX",
      qrImage: "",
      active: true
    }
  ]
};


