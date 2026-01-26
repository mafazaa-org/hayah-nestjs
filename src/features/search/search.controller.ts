import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SearchService } from './search.service';
import { GlobalSearchDto } from './dto/global-search.dto';
import { GlobalSearchResultDto } from './dto/global-search-result.dto';
import { SearchHistoryResponseDto } from './dto/search-history-response.dto';

@ApiTags('search')
@ApiBearerAuth('access-token')
@Controller('search')
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Post('global')
  globalSearch(
    @CurrentUser() user: { userId: string },
    @Body() searchDto: GlobalSearchDto,
  ): Promise<GlobalSearchResultDto> {
    return this.searchService.globalSearch(user.userId, searchDto);
  }

  @Get('recent')
  async getRecentSearches(
    @CurrentUser() user: { userId: string },
    @Query('limit') limit?: string,
  ): Promise<SearchHistoryResponseDto[]> {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const searches = await this.searchService.getRecentSearches(
      user.userId,
      limitNum,
    );
    return searches.map((search) => ({
      id: search.id,
      query: search.query,
      filters: search.filters,
      createdAt: search.createdAt,
    }));
  }

  @Delete('history')
  clearSearchHistory(@CurrentUser() user: { userId: string }): Promise<void> {
    return this.searchService.clearSearchHistory(user.userId);
  }
}
