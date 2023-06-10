# prisma-generator-paginator

> This generator was bootstraped using [create-prisma-generator](https://github.com/YassinEldeeb/create-prisma-generator)

# Introduction
I'm formerly Laravel developer with LighthousePHP where has a lot of helpful directives such as @paginate, and I want some type that could return value like Lighthouse does, so this generator will fetch every models and generate LighthousePHP @paginate type to using in resolvers

## Usage

```
// schema.prisma
generator nestgraphql {

    // Please use with prisma-nestjs-graphql
    provider = "node node_modules/prisma-nestjs-graphql"
    output = "../src/@generated"

    // field_Validator_from = "class-validatior"
    // field_Validator_input = true
}

generator paginateType {
    provider = "node node_modules/@mukurowz/prisma-type-paginator"
    output = "../src/@generated"
}
```

---

```
// user.resolver.ts
import { Injectable } from '@nestjs/common';
import { UserCreateInput } from 'src/@generated/user/user-create.input';
import { UserPaginator } from 'src/@generated/user/user-paginator.output';
import { UserWhereInput } from 'src/@generated/user/user-where.input';
import { User } from 'src/@generated/user/user.model';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // ...

  async findAllUsers(first: number, page: number, where: UserWhereInput): Promise<UserPaginator> {
    return this.prisma.user.findMany({
      take: first,
      skip: (page - 1) * first,
      where,
    });
  }
}

```
