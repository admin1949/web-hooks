import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class WebHooksService {
  constructor(private readonly prisma: PrismaService) {}

  async find(userWhereUniqueInput: Prisma.BuildHistoryWhereUniqueInput) {
    return this.prisma.buildHistory.findUnique({
      where: userWhereUniqueInput,
    });
  }

  async getList(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.BuildHistoryWhereUniqueInput;
    where?: Prisma.BuildHistoryWhereInput;
    orderBy?: Prisma.BuildHistoryOrderByWithRelationInput;
  }) {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.buildHistory.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async create(data: Prisma.BuildHistoryCreateInput) {
    return this.prisma.buildHistory.create({
      data,
    });
  }

  async update(params: {
    where: Prisma.BuildHistoryWhereUniqueInput;
    data: Prisma.BuildHistoryUpdateInput;
  }) {
    const { where, data } = params;

    return this.prisma.buildHistory.update({
      data,
      where,
    });
  }

  async delete(where: Prisma.BuildHistoryWhereUniqueInput) {
    this.prisma.buildHistory.delete({
      where,
    });
  }

  async deleteUser(where: Prisma.BuildHistoryWhereUniqueInput) {
    return this.prisma.buildHistory.delete({
      where,
    });
  }
}
