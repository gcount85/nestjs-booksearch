export interface BookItemDTO {
  title: string;
  link: string;
  image: string;
  author: string;
  discount: string;
  publisher: string;
  pubdate: string;
  isbn: string;
  description: string;
}

export interface BookItemsDTO {
  lastBuildDate: string;
  total: number;
  start: number;
  display: number;
  items: BookItemDTO[];
}
