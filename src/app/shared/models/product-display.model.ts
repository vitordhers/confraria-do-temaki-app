import { IPrice } from '../interfaces/price.interface';
import { IProduct } from '../interfaces/product.interface';

export class ProductDisplay implements IProduct {
  constructor(
    public id: string,
    public name: string,
    public categoriesIds: string[],
    public unitsAvailable: string[],
    public price: IPrice[],
    public slug: string,
    public imageUrl?: string,
    public description?: string,
    public rank?: number
  ) {}
}
