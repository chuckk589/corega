import { BeforeCreate, BeforeUpdate, Collection, Entity, EntityRepository, EntityRepositoryType, Enum, ManyToOne, OneToMany, PrimaryKey, Property, Unique } from '@mikro-orm/core';
// import { compare, hash } from 'bcrypt';
import { Promo } from './Promo';
import { Check } from './Check';
import { City } from './City';
import { Ticket } from './Ticket';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}
export enum Locale {
  RU = 'ru',
  UZ = 'uz',
}
export enum UserGender {
  MALE = 'male',
  FEMALE = 'female',
}

@Entity()
export class User {
  [EntityRepositoryType]?: UserRepository;

  @PrimaryKey()
  id!: number;

  @Unique()
  @Property({ length: 255, nullable: true })
  chatId!: string;

  @Unique()
  @Property({ length: 255, nullable: true })
  username?: string;

  @Property({ length: 255, nullable: true })
  credentials?: string;

  @ManyToOne(() => City, { nullable: true })
  city?: City;

  @Enum({ items: () => Locale, default: Locale.RU })
  locale: Locale;

  @Enum({ items: () => UserRole, default: UserRole.USER })
  role: UserRole;

  @Property({ nullable: true })
  phone?: string;

  @Property({ default: false })
  registered?: boolean;

  // @ManyToOne(() => Promo, { nullable: true })
  // promo?: Promo;

  @OneToMany(() => Check, (check) => check.user, { orphanRemoval: true })
  checks = new Collection<Check>(this);

  @OneToMany(() => Ticket, (ticket) => ticket.user, { orphanRemoval: true })
  tickets = new Collection<Ticket>(this);
  // @Enum({ items: () => UserGender, nullable: true })
  // gender?: UserGender;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
export class UserRepository extends EntityRepository<User> {
  findOrCreate(where: Partial<User>, payload: Partial<User>): Promise<User> {
    const em = this.getEntityManager();
    return em.findOne(User, where).then((user) => {
      if (user) {
        return user;
      }
      return em.create(User, payload);
    });
  }
}
