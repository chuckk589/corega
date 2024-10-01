import { Composer, Context, FilterQuery } from 'grammy';
import { LISTENERS_METADATA } from 'src/constants';
import { match } from 'src/modules/bot/common/helpers';
import { BotContext } from 'src/types/interfaces';

class BotListenerMetadata {
  constructor(method: ComposerMethod, payload: any, key: string, parent?: string) {
    this.method = method;
    this.payload = method == ComposerMethod.hears ? match(payload) : payload;
    this.key = String(key);
    this.parent = parent;
  }
  parent: string | undefined;
  method: ComposerMethod;
  payload: string | RegExp;
  key: string;
  children?: BotListenerMetadata[] = [];
}

enum ComposerMethod {
  command = 'command',
  on = 'on',
  use = 'use',
  hears = 'hears',
  // text = 'text',
  // menu = 'menu',
  // back = 'back',
  filter = 'filter',
  // dynamic = 'dynamic',
  // menuText = 'menuText',
}

export type MenuKeyFunction = (ctx: BotContext) => { keys: string[] };

function concatChildren(children: BotListenerMetadata[], parent: Composer<BotContext>) {
  children.forEach((child) => {
    const pm = applyComposerMethod.call(this, child, parent);
    if (child.children.length) {
      concatChildren.call(this, child.children, pm);
    }
  });
}
function applyComposerMethod(handler: BotListenerMetadata, parent?: Composer<BotContext>): Composer<BotContext> {
  switch (handler.method) {
    case ComposerMethod.command:
    case ComposerMethod.on:
    case ComposerMethod.hears:
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return parent[handler.method](handler.payload, this[handler.key]);
    case ComposerMethod.use:
    case ComposerMethod.filter:
      return parent[handler.method](this[handler.key]);
  }
}
export function ComposerController<T extends { new (...args: any[]): any }>(constructor: T) {
  return class extends constructor {
    get _composer() {
      const composer = new Composer<BotContext>();
      let handlers: BotListenerMetadata[] = Reflect.getMetadata(LISTENERS_METADATA, this);
      //fill children
      handlers = handlers.filter((handler) => (handler.parent ? !handlers.find((h) => h.key === handler.parent)?.children.push(handler) : true));
      concatChildren.call(this, handlers, composer);
      return composer;
    }
    // _composer = fn(() => {
    //   const composer = new Composer();
    //   const handlers: BotListenerMetadata[] = Reflect.getMetadata(LISTENERS_METADATA, constructor.prototype);

    //   const that = <any>this;
    // handlers = handlers.filter((handler) =>
    //   handler.parent ? !handlers.find((h) => h.key === handler.parent)?.children.push(handler) : true,
    // );

    //   //console.log(handlers);
    //   handlers.map((handler) => {
    //     switch (handler.method) {
    //       case ComposerMethod.on: {
    //         composer.on(handler.payload as FilterQuery, that[handler.key]);
    //         break;
    //       }
    //       case ComposerMethod.command: {
    //         composer.command(handler.payload as FilterQuery, that[handler.key]);
    //         break;
    //       }
    //       case ComposerMethod.use: {
    //         composer.use(that[handler.key]);
    //         break;
    //       }
    //       case ComposerMethod.hears: {
    //         composer.hears(handler.payload, that[handler.key]);
    //         break;
    //       }
    //       case ComposerMethod.filter: {
    //         composer.filter(that[handler.key]);

    //         break;
    //       }
    //       // case ComposerMethod.dynamic: {
    //       //   const menu = new MenuGrammy<BotContext>(String(handler.payload));
    //       //   menu.dynamic((ctx: BotContext, range) => {
    //       //     const keys: string[] = that[handler.key](ctx);
    //       //     handler.children
    //       //       .filter((child) => keys.includes(String(child.payload)))
    //       //       .map((child) => {
    //       //         switch (child.method) {
    //       //           case ComposerMethod.menuText: {
    //       //             range.text(String(child.payload), that[child.key]);
    //       //             break;
    //       //           }
    //       //         }
    //       //       });
    //       //     return range;
    //       //   });
    //       //   composer.use(menu);
    //       //   break;
    //       // }
    //     }
    //   });
    //   return composer;
    // });
  };
}

function createListenerDecorator<T>(method: ComposerMethod) {
  return (payload?: T, parent?: string): PropertyDecorator => {
    return (_target: any, _key?: string) => {
      const metadata: BotListenerMetadata[] = [new BotListenerMetadata(method, payload, _key, parent)];
      const previousValue = Reflect.getMetadata(LISTENERS_METADATA, _target) || [];
      const value = [...previousValue, ...metadata];
      Reflect.defineMetadata(LISTENERS_METADATA, value, _target);
    };
  };
}

// function createMenuListenerDecorator(method: ComposerMethod) {
//   return (owningMenu: string, resolveKey: string): PropertyDecorator => {
//     return (_target: any, _key?: any) => {
//       const previousValue: BotListenerMetadata[] = Reflect.getMetadata(LISTENERS_METADATA, _target);
//       const parent: BotListenerMetadata = previousValue.find((r) => r.payload == owningMenu);
//       if (!parent) throw new Error('Parent menu doesnt exists');
//       parent.children.push(new BotListenerMetadata(method, resolveKey, _key));
//     };
//   };
// }
export const Use = createListenerDecorator(ComposerMethod.use);
export const Command = createListenerDecorator<string>(ComposerMethod.command);
// export const Menu = createListenerDecorator<string>(ComposerMethod.menu);
// export const DynamicMenu = createListenerDecorator<string>(ComposerMethod.dynamic);
export const On = createListenerDecorator<FilterQuery | FilterQuery[]>(ComposerMethod.on);
export const Filter = createListenerDecorator(ComposerMethod.filter);
export const Hears = createListenerDecorator(ComposerMethod.hears);
