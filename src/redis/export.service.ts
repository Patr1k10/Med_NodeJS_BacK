import { Inject, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as json2csv from 'json2csv';
import { Cache } from 'cache-manager';
import { QuizResult } from '../quizzes/entities/quiz.result.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class ExportService {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async exportToJson(companyId?: number, quizId?: number, userId?: number): Promise<void> {
    const results = await this.getResultsFromCache(companyId, quizId, userId);
    const jsonResult = JSON.stringify(results, null, 2);
    fs.writeFileSync('exported_data.json', jsonResult);
  }

  async exportToCsv(companyId?: number, quizId?: number, userId?: number): Promise<void> {
    const results = await this.getResultsFromCache(companyId, quizId, userId);
    const csvResult = json2csv.parse(results, { header: true });
    fs.writeFileSync('exported_data.csv', csvResult);
  }

  private async getResultsFromCache(companyId?: number, quizId?: number, userId?: number): Promise<QuizResult[]> {
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
    const cacheKey = cacheKeyPrefix;
    const cachedData = await this.cache.get(cacheKey);
    if (!cachedData) {
      throw new Error('Data not found in cache');
    }
    return Array.isArray(cachedData) ? cachedData : [cachedData];
  }
}
