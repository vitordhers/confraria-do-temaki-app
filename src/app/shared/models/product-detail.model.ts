import { IIngredient } from '../interfaces/ingredient.interface';
import { IPrice } from '../interfaces/price.interface';
import { IProduct } from '../interfaces/product.interface';

export class ProductDetail implements IProduct {
  constructor(
    public id: string | undefined,
    public name: string,
    public categoriesIds: string[],
    public unitsAvailable: string[],
    public price: IPrice[],
    public slug: string,
    public imageUrl?: string,
    public description?: string,
    public attributes?: any[],
    public requested?: boolean,
    public conditions?: string[],
    public notes?: string[],
    public ingredients?: IIngredient[],
    public rank?: number
  ) {}
}
