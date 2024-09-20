import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { subtle } from 'node:crypto';

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

  private hexToBytes(hex: string) {
    let len = hex.length / 2;
    let bytes = new Uint8Array(len);

    let index = 0;
    for (let i = 0; i < hex.length; i += 2) {
      let c = hex.slice(i, i + 2);
      let b = parseInt(c, 16);
      bytes[index] = b;
      index += 1;
    }

    return bytes;
  }

  private encoder = new TextEncoder();

  async checkRequest(secret: string, signature: string, payload: string) {
    const algorithm = { name: 'HMAC', hash: { name: 'SHA-256' } };

    const keyBytes = this.encoder.encode(secret);
    const extractable = false;
    const key = await subtle.importKey(
      'raw',
      keyBytes,
      algorithm,
      extractable,
      ['sign', 'verify'],
    );

    const sigBytes = this.hexToBytes(signature.split('=')[1] || '');
    const dataBytes = this.encoder.encode(payload);
    const equal = await subtle.verify(algorithm.name, key, sigBytes, dataBytes);

    return equal;
  }
}
