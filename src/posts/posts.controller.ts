import {
    Body,
    Controller,
    Delete,
    Get,
    NotFoundException,
    Param,
    Post,
    Put,
    Query,
    Req,
  } from '@nestjs/common';
  import { Request } from 'express';
  import { CreatePostDTO } from './create-posts.dto';
  import { PostsService } from './posts.service';
  import { ApiParam, ApiQuery } from '@nestjs/swagger';
  import { JwtPayloadDTO } from 'src/auth/dto/jwt-payload.dto';
  import { Posts } from './posts.entity';
  
  @Controller('post')
  export class PostController {
    constructor(private readonly postService: PostsService) {}
  
    @Post()
    async create(@Req() request: Request, @Body() createPostDTO: CreatePostDTO): Promise<void> {
      const userJwtPayLoad: JwtPayloadDTO = request['user'];
  
      const post: Posts = new Posts();
      post.content = createPostDTO.content;
      post.image_url = createPostDTO.image_url;
      post.title = createPostDTO.title;
      post.user_id = userJwtPayLoad.sub;
      await this.postService.save(post);
    }
  
    @Get()
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
    async findAll(
      @Req() request: Request,
      @Query('page') page: number = 1,
      @Query('limit') limit: number = 10,
    ): Promise<Posts[]> {
      const userJwtPayLoad: JwtPayloadDTO = request['user'];
      return await this.postService.findByUserId(userJwtPayLoad.sub, page, limit);
    }
  
    @Get(':id')
    @ApiParam({ name: 'id', type: Number, description: 'ID of the post' })
    async findOne(@Req() request: Request, @Param('id') id: number): Promise<Posts> {
      const userJwtPayLoad: JwtPayloadDTO = request['user'];
      return await this.postService.findByUserIdAndPostId(userJwtPayLoad.sub, id);
    }
  
    @Put(':id')
    @ApiParam({ name: 'id', type: Number, description: 'ID of the post' })
    async updateOne(
      @Req() request: Request,
      @Param('id') id: number,
      @Body() createPostDTO: CreatePostDTO
    ): Promise<void> {
      const userJwtPayLoad: JwtPayloadDTO = request['user'];
      const post: Posts = await this.postService.findByUserIdAndPostId(userJwtPayLoad.sub, id);
      if (!post || post.id == null) {
        throw new NotFoundException('Post not found');
      }
  
      post.content = createPostDTO.content;
      post.image_url = createPostDTO.image_url;
      post.title = createPostDTO.title;
      await this.postService.save(post);
    }
  
    @Delete(':id')
    @ApiParam({ name: 'id', type: Number, description: 'ID of the post' })
    async deleteOne(@Req() request: Request, @Param('id') id: number): Promise<void> {
      const userJwtPayLoad: JwtPayloadDTO = request['user'];
      const post: Posts = await this.postService.findByUserIdAndPostId(userJwtPayLoad.sub, id);
      if (!post || post.id == null) {
        throw new NotFoundException('Post not found');
      }
  
      await this.postService.deleteById(id);
    }
  }