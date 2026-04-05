type CustomerRow = {
  name: string;
  nationalId: string;
  phone: string;
  cardNumber: string;
  cardCreatedAt: string;
};
export const rows: CustomerRow[] = [
  {
    name: "عبدالعزيز العدامات",
    nationalId: "9876543210",
    phone: "0791234567",
    cardNumber: "C-00018273",
    cardCreatedAt: "2022-03-14",
  },
  {
    name: "عبدالحميد الشرفات",
    nationalId: "9988776655",
    phone: "0785554411",
    cardNumber: "C-00019410",
    cardCreatedAt: "2021-11-02",
  },
  {
    name: "عبدالله العمري",
    nationalId: "1122334455",
    phone: "0779012345",
    cardNumber: "C-00025501",
    cardCreatedAt: "2020-08-21",
  },
  {
    name: "رنا المومني",
    nationalId: "2233445566",
    phone: "0798877665",
    cardNumber: "C-00023340",
    cardCreatedAt: "2023-01-07",
  },
  {
    name: "محمود الطراونة",
    nationalId: "3344556677",
    phone: "0781122334",
    cardNumber: "C-00030199",
    cardCreatedAt: "2024-04-19",
  },
];

export const headers = [
  "الاسم",
  "الرقم الوطني",
  "رقم الهاتف",
  "رقم البطاقة",
  "تاريخ انشاء البطاقة",
];
