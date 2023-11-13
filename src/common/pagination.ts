import { Repository, SelectQueryBuilder } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { PaginatedData } from '../types/interface';

export async function paginate<T>(
  repository: Repository<T>,
  queryBuilder: SelectQueryBuilder<T>,
  page: number,
  limit: number,
): Promise<PaginatedData<T>> {
  const skip = (page - 1) * limit;
  const [data, total] = await queryBuilder.skip(skip).take(limit).getManyAndCount();

  if (!data.length) {
    throw new NotFoundException('No data found');
  }

  return { data, total, page, limit };
}
