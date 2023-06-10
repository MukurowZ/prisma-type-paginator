import { generatorHandler, GeneratorOptions } from '@prisma/generator-helper';
import type { DMMF } from '@prisma/client/runtime';
import path from 'path';
import { kebabCase } from 'lodash';
import fs from 'fs';
import prettier from 'prettier';

function generatePaginator(model: DMMF.Model) {
  const modelName = model.name;
  const typeName = `${modelName}Paginator`;
  return `
import { ObjectType, Field } from '@nestjs/graphql';
import { ${modelName} } from '../${kebabCase(modelName)}/${kebabCase(modelName)}.model';
import { PaginatorInfo } from '../prisma/paginator-info.output';

@ObjectType({})
export class ${typeName} {

  @Field(() => PaginatorInfo, {nullable:false})
  paginatorInfo: PaginatorInfo;

  @Field(() => [${modelName}], {nullable:false})
  data: Array<${modelName}>;
}
`;
}

function paginatorType() {
  return `
import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType({})
export class PaginatorInfo {

  @Field(() => Int, {nullable:false})
  count: number;

  @Field(() => Int, {nullable:false})
  currentPage: number;

  @Field(() => Int, {nullable:false})
  firstItem: number;

  @Field(() => Boolean, {nullable:false})
  hasMorePages: false;

  @Field(() => Int, {nullable:false})
  lastItem: number;

  @Field(() => Int, {nullable:false})
  lastPage: number;

  @Field(() => Int, {nullable:false})
  perPage: number;

  @Field(() => Int, {nullable:false})
  total: number;
}
`;
}

export const formatFile = (content: string): Promise<string> => {
  return new Promise((res, rej) =>
    prettier.resolveConfig(process.cwd()).then((options) => {
      if (!options) {
        res(content); // no prettier config was found, no need to format
      }

      try {
        const formatted = prettier.format(content, {
          ...options,
          parser: 'typescript',
        });

        res(formatted);
      } catch (error) {
        rej(error);
      }
    }),
  );
};

const writeFileSafely = async (writeLocation: string, content: any) => {
  fs.mkdirSync(path.dirname(writeLocation), {
    recursive: true,
  });

  fs.writeFileSync(writeLocation, await formatFile(content));
};

generatorHandler({
  onManifest() {
    return {
      defaultOutput: '.',
      prettyName: 'Prisma Type Paginator',
    };
  },
  onGenerate: async (options: GeneratorOptions) => {
    // eslint-disable-next-line
    const baseDir = options.generator.output?.value!;

    await writeFileSafely(path.join(baseDir, 'prisma', 'paginator-info.output.ts'), paginatorType());

    const { datamodel } = JSON.parse(JSON.stringify(options.dmmf)) as DMMF.Document;

    datamodel.models.forEach(async (model) => {
      const writeLocation = path.join(baseDir, `${kebabCase(model.name)}`, `${kebabCase(model.name)}-paginator.output.ts`);

      await writeFileSafely(writeLocation, generatePaginator(model));
    });
  },
});
