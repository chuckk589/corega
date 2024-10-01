// import { EntityManager, FilterQuery, wrap } from '@mikro-orm/core';
// import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

// import { getRandomArrayValues } from '../bot/common/helpers';
// import { Check } from '../mikroorm/entities/Check';
// import { CheckState } from '../mikroorm/entities/CheckStatus';
// import { Lottery } from '../mikroorm/entities/Lottery';
// import { LotteryStatus } from '../mikroorm/entities/LotteryStatus';
// import { Prize } from '../mikroorm/entities/Prize';
// import { Winner } from '../mikroorm/entities/Winner';
// import { CreateWinnerDto } from '../winner/dto/create-winner.dto';
// import { CreateLotteryDto } from './dto/create-lottery.dto';
// import { RetrieveLotteryDto, RetrieveWinnerDto } from './dto/retrieve-lottery.dto';
// import { UpdateLotteryDto } from './dto/update-lottery.dto';
// import { PRIZE_MAIN, PRIZE_WEEKLY_ALL, PRIZE_WEEKLY_BARCODES, PRIZE_WEEKLY_CHECKS } from 'src/constants';

// @Injectable()
// export class LotteryService {
//   constructor(private readonly em: EntityManager) {}
//   async addWinner(createWinnerDto: CreateWinnerDto, id: number) {
//     const lottery = await this.em.findOne(Lottery, id);

//     const check = await this.em.findOne(Check, { fancyId: createWinnerDto.fancyId }, { populate: ['user'] });
//     if (!check) {
//       throw new HttpException(`Чек с номером ${createWinnerDto.fancyId} не найден`, HttpStatus.BAD_REQUEST);
//     }

//     lottery.winners.add(
//       this.em.create(Winner, {
//         check: check,
//       }),
//     );
//     await this.em.persistAndFlush(lottery);

//     await wrap(lottery).init(true, ['status.translation.values', 'prize.translation.values', 'winners.check.user']);
//     return new RetrieveLotteryDto(lottery);
//     // const where = this.getPrizeQuery(lottery.prize.name, lottery);

//     // const existingWinners = await this.em.find(Winner, {}, { populate: ['check.user'] });

//     // const checks = await this.em.find(
//     //   Check,
//     //   {
//     //     ...(where as any),
//     //     status: { name: CheckState.APPROVED },
//     //     user: { $nin: existingWinners.map((w) => w.check.user.id) },
//     //   },
//     //   { populate: ['winners'] },
//     // );
//     // const filteredChecks = checks.filter((check, index, self) => self.findIndex((t) => t.user.id === check.user.id) === index);

//     // if (filteredChecks.length == 0) {
//     //   throw new HttpException(`Нет подходящих чеков`, HttpStatus.BAD_REQUEST);
//     // }
//     // //get random checkk
//     // const winner = getRandomArrayValues(filteredChecks, 1)[0];
//     // const newWinner = this.em.create(Winner, {
//     //   check: this.em.getReference(Check, winner.id),
//     //   primary: createWinnerDto.primary,
//     // });
//     // lottery.winners.add(newWinner);
//     // await this.em.persistAndFlush(lottery);
//     // await wrap(lottery).init(true, ['status.translation.values', 'prize.translation.values', 'winners.check.user']);
//     // return new RetrieveLotteryDto(lottery);
//   }
//   async create(createLotteryDto: CreateLotteryDto): Promise<RetrieveLotteryDto> {
//     createLotteryDto.reserveWinners = createLotteryDto.primaryWinners;
//     //should be at least equal
//     if (createLotteryDto.primaryWinners < createLotteryDto.reserveWinners) {
//       throw new HttpException(
//         `Number of primaryWinners should bot be less than reserveWiners , \nPrimary: ${Number(createLotteryDto.primaryWinners)}, \nReserve: ${createLotteryDto.reserveWinners}`,
//         HttpStatus.BAD_REQUEST,
//       );
//     }
//     const requestedPrize = await this.em.findOne(Prize, { id: Number(createLotteryDto.prize) });

//     const where = this.getPrizeQuery(requestedPrize.name, createLotteryDto);
//     //only select checks that belong to users that have not won yet
//     const existingWinners = await this.em.find(Winner, {}, { populate: ['check.user'] });
//     //distinct users
//     const checks = await this.em.find(
//       Check,
//       {
//         ...(where as any),
//         status: { name: CheckState.APPROVED },
//         user: { $nin: existingWinners.map((w) => w.check.user.id) },
//       },
//       { populate: ['winners'] },
//     );
//     //leave 1 check for each user
//     const filteredChecks = checks.filter((check, index, self) => self.findIndex((t) => t.user.id === check.user.id) === index);

//     const totalWinners = Number(createLotteryDto.primaryWinners) + Number(createLotteryDto.reserveWinners);

//     //count unique users
//     // const users = new Set(checks.map((c) => c.user.id));
//     if (filteredChecks.length < totalWinners) {
//       throw new HttpException(`Not enough users, \nRequested ${totalWinners}, \nAvailable: ${filteredChecks.length}`, HttpStatus.BAD_REQUEST);
//     }

//     if (checks.length < totalWinners) {
//       throw new HttpException(`Not enough checks, \nRequested ${totalWinners}, \nAvailable: ${checks.length}`, HttpStatus.BAD_REQUEST);
//     }
//     const winners = getRandomArrayValues(filteredChecks, totalWinners);
//     const lottery = this.em.create(Lottery, {
//       primaryWinners: Number(createLotteryDto.primaryWinners),
//       reserveWinners: Number(createLotteryDto.reserveWinners),
//       prize: requestedPrize,
//       end: createLotteryDto.end,
//       start: createLotteryDto.start,
//       winners: winners.map((winner, index) =>
//         this.em.create(Winner, {
//           check: this.em.getReference(Check, winner.id),
//           primary: index < Number(createLotteryDto.primaryWinners),
//         }),
//       ),
//     });
//     await this.em.persistAndFlush(lottery);
//     await wrap(lottery).init(true, ['status.translation.values', 'prize.translation.values', 'winners.check.user.city.translation.values']);
//     return new RetrieveLotteryDto(lottery);
//   }

//   async findAll(): Promise<RetrieveLotteryDto[]> {
//     return (
//       await this.em.find(
//         Lottery,
//         {},
//         {
//           populate: ['status.translation.values', 'prize.translation.values', 'winners.check.user', 'winners.prizeValue'],
//         },
//       )
//     ).map((lottery) => new RetrieveLotteryDto(lottery));
//   }

//   async update(id: number, updateLotteryDto: UpdateLotteryDto) {
//     const lottery = await this.em.findOne(Lottery, id);
//     lottery.status = this.em.getReference(LotteryStatus, Number(updateLotteryDto.status));
//     lottery.start = updateLotteryDto.start;
//     lottery.end = updateLotteryDto.end;
//     await this.em.persistAndFlush(lottery);
//     await wrap(lottery).init(true, ['winners.check.user', 'prize.translation.values']);
//     return new RetrieveLotteryDto(lottery);
//   }

//   async remove(id: number) {
//     const lottery = await this.em.find(Lottery, { id }, { populate: ['winners'] });
//     await this.em.removeAndFlush(lottery);
//   }
//   private getPrizeQuery(prizeName: string, createLotteryDto: Pick<CreateLotteryDto, 'start' | 'end'>): FilterQuery<Check> {
//     if (prizeName == PRIZE_WEEKLY_CHECKS) {
//       return {
//         createdAt: {
//           $gte: createLotteryDto.start,
//           $lt: createLotteryDto.end,
//         },
//         isBarcode: false,
//       };
//     } else if (prizeName == PRIZE_WEEKLY_BARCODES) {
//       return {
//         createdAt: {
//           $gte: createLotteryDto.start,
//           $lt: createLotteryDto.end,
//         },
//         isBarcode: true,
//       };
//     } else if (prizeName == PRIZE_WEEKLY_ALL) {
//       return {
//         createdAt: {
//           $gte: createLotteryDto.start,
//           $lt: createLotteryDto.end,
//         },
//       };
//     } else if (prizeName == PRIZE_MAIN) {
//       return {};
//     }
//   }
// }
