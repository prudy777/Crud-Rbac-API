// src/common/utils/pagination.utils.ts
import { NotFoundException } from '@nestjs/common';
import type { QueryPaginationDto } from '../dtos/query-pagination.dto';

const DEFAULT_PAGE_NUMBER = 1;
const DEFAULT_PAGE_SIZE = 10;

export interface PaginateOutput<T> {
  data: T[];
  meta: {
    total: number;
    lastPage: number;
    currentPage: number;
    totalPerPage: number;
    prevPage: number | null;
    nextPage: number | null;
  };
}

const toInt = (val?: string, fallback = 0) => {
  const n = Number.parseInt(val ?? '', 10);
  return Number.isFinite(n) ? Math.abs(n) : fallback;
};

export const paginate = (
  query: QueryPaginationDto = {},
): { skip: number; take: number } => {
  const size = toInt(query.size, DEFAULT_PAGE_SIZE) || DEFAULT_PAGE_SIZE;
  const page = toInt(query.page, DEFAULT_PAGE_NUMBER) || DEFAULT_PAGE_NUMBER;
  return {
    skip: size * (page - 1),
    take: size,
  };
};

export const paginateOutput = <T>(
  data: T[],
  total: number,
  query: QueryPaginationDto = {},
): PaginateOutput<T> => {
  const size = toInt(query.size, DEFAULT_PAGE_SIZE) || DEFAULT_PAGE_SIZE;
  const page = toInt(query.page, DEFAULT_PAGE_NUMBER) || DEFAULT_PAGE_NUMBER;
  const lastPage = Math.max(1, Math.ceil(total / size));

  if (!data.length) {
    // empty page result (also covers total=0)
    return {
      data,
      meta: {
        total,
        lastPage,
        currentPage: page,
        totalPerPage: size,
        prevPage: null,
        nextPage: null,
      },
    };
  }

  if (page > lastPage) {
    throw new NotFoundException(`Page ${page} not found. Last page is ${lastPage}`);
  }

  return {
    data,
    meta: {
      total,
      lastPage,
      currentPage: page,
      totalPerPage: size,
      prevPage: page > 1 ? page - 1 : null,
      nextPage: page < lastPage ? page + 1 : null,
    },
  };
};
