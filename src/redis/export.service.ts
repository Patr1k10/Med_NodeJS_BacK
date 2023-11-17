import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as json2csv from 'json2csv';
import { Cache } from 'cache-manager';
import { QuizResult } from '../quizzes/entities/quiz.result.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Response } from 'express';

@Injectable()
export class ExportService {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async exportToJson(response: Response, companyId?: number, quizId?: number, userId?: number): Promise<void> {
    const results = await this.getResultsFromCache(companyId, quizId, userId);
    const jsonResult = JSON.stringify(results, null, 2);
    response.attachment('exported_data.json');
    response.status(200).send(jsonResult);
  }

  async exportToCsv(response: Response, companyId?: number, quizId?: number, userId?: number): Promise<void> {
    const results = await this.getResultsFromCache(companyId, quizId, userId);
    const csvResult = json2csv.parse(results);
    response.attachment('exported_data.csv');
    response.status(200).send(csvResult);
  }

  private async getResultsFromCache(companyId?: number, quizId?: number, userId?: number): Promise<any> {
    let cacheKeyPrefix = 'quizResult';

    if (companyId !== undefined) {
      cacheKeyPrefix += `:${companyId}`;
    }
    if (quizId !== undefined) {
      cacheKeyPrefix += `:${quizId}`;
    }
    if (userId !== undefined) {
      cacheKeyPrefix += `:${userId}`;
    }
    if (companyId === undefined && quizId === undefined && userId === undefined) {
      throw new Error('At least one of companyId, quizId, or userId must be provided for cache retrieval.');
    }

    const cacheKey = cacheKeyPrefix;
    console.log(cacheKey);
    const keys = await this.cache.store.keys(`${cacheKey}*`);
    const values = await this.cache.store.mget(...keys);

    if (!values || values.length === 0) {
      throw new NotFoundException('Data not found in cache');
    }

    return Array.isArray(values) ? values : [values];
  }
}
