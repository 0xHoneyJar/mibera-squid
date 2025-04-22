import { Arg, Field, ObjectType, Query, Resolver } from "type-graphql";
import { type EntityManager } from "typeorm";
import { AvailableToken } from "../../model";

@ObjectType()
class TokenInfo {
  @Field(() => String)
  id!: string;

  @Field(() => String)
  chain!: string;

  @Field(() => String)
  tokenId!: string;
}

@Resolver()
export class AvailableTokensResolver {
  constructor(private tx: () => Promise<EntityManager>) {}

  @Query(() => [TokenInfo])
  async getAvailableTokens(
    @Arg("chain", () => String, { nullable: true }) chain?: string
  ): Promise<TokenInfo[]> {
    const manager = await this.tx();

    const query = manager
      .getRepository(AvailableToken)
      .createQueryBuilder("token")
      .where("token.isAvailable = :isAvailable", { isAvailable: true });

    if (chain) {
      query.andWhere("token.chain = :chain", { chain });
    }

    const availableTokens = await query.getMany();

    return availableTokens.map((token) => {
      const [tokenId, chainId] = token.id.split('-');
      return {
        id: token.id,
        chain: token.chain,
        tokenId
      };
    });
  }
} 