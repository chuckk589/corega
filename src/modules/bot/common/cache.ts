import { InputFile } from 'grammy';
import { Message } from 'grammy/types';

class Cache {
  constructor() {
    this._cache = new Map();
  }
  private _cache: Map<string, any>;
  //TODO: remove hardcoded language
  private _assets: { [key: string]: string } = {
    oferta_ru: 'dist/public/assets/oferta_ru.pdf',
    oferta_uz: 'dist/public/assets/oferta_uz.pdf',
    start: 'dist/public/assets/start.png',
    about_ru: 'dist/public/assets/about_ru.png',
    about_uz: 'dist/public/assets/about_uz.png',
    pinfl_help: 'dist/public/assets/pinfl_help.png',
    start_ru: 'dist/public/assets/start_ru.png',
    start_uz: 'dist/public/assets/start_uz.png',
    phone_ru: 'dist/public/assets/phone_ru.png',
    phone_uz: 'dist/public/assets/phone_uz.png',
    lang: 'dist/public/assets/lang.png',
    city_ru: 'dist/public/assets/city_ru.png',
    city_uz: 'dist/public/assets/city_uz.png',
    menu_ru: 'dist/public/assets/menu_ru.png',
    menu_uz: 'dist/public/assets/menu_uz.png',
    card_ru: 'dist/public/assets/card_ru.png',
    card_uz: 'dist/public/assets/card_uz.png',
    promo_ru: 'dist/public/assets/promo_ru.pdf',
    promo_uz: 'dist/public/assets/promo_uz.pdf',
    prod_ru: 'dist/public/assets/prod_ru.pdf',
    prod_uz: 'dist/public/assets/prod_uz.pdf',
    // parCheck_ru: 'dist/public/assets/parCheck_ru.png',
    // parCheck_kz: 'dist/public/assets/parCheck_kz.png',
    // parBarcode_ru: 'dist/public/assets/parBarcode_ru.png',
    // parBarcode_kz: 'dist/public/assets/parBarcode_kz.png',
    // contacts_ru: 'dist/public/assets/contacts_ru.png',
    // contacts_kz: 'dist/public/assets/contacts_kz.png',
  };
  public resolveAsset(name: string): string | InputFile {
    if (this._cache.has(name)) return this._cache.get(name);
    if (name in this._assets) {
      return new InputFile(this._assets[name]);
    }
  }
  public resolveImage(localPath: string): string | InputFile {
    if (this._cache.has(localPath)) return this._cache.get(localPath);
    return new InputFile(`dist/public/${localPath}`);
  }
  public cacheAsset(name: string, msg: Message.PhotoMessage | Message.DocumentMessage | Message.VideoMessage): void {
    if (this._cache.has(name)) return;
    if ('photo' in msg) {
      this._cache.set(name, msg.photo[0].file_id);
    } else if ('document' in msg) {
      this._cache.set(name, msg.document.file_id);
    } else if ('video' in msg) {
      this._cache.set(name, msg.video.file_id);
    }
  }
}

export default new Cache();
