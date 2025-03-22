import { Arg, Field, Int, ObjectType, Query, Resolver } from "type-graphql";
import { type EntityManager } from "typeorm";
import { Participation } from "../../model";

@ObjectType()
class PhaseParticipationStats {
  @Field(() => Int)
  phase!: number;

  @Field(() => Int)
  uniqueParticipants!: number;

  @Field(() => Int)
  totalParticipations!: number;

  @Field(() => String)
  totalAmount!: string; // Using string to represent BigInt
}

@ObjectType()
class PresaleStats {
  @Field(() => [PhaseParticipationStats])
  phaseStats!: PhaseParticipationStats[];

  @Field(() => Int)
  totalUniqueParticipants!: number;

  @Field(() => Int)
  totalParticipations!: number;

  @Field(() => String)
  totalAmount!: string;
}

@Resolver()
export class PresaleStatsResolver {
  constructor(private tx: () => Promise<EntityManager>) {}

  @Query(() => PresaleStats)
  async getPresaleStats(
    @Arg("phase", () => Int, { nullable: true }) phase?: number
  ): Promise<PresaleStats> {
    const manager = await this.tx();

    // Base query for all stats
    const baseQuery = manager
      .getRepository(Participation)
      .createQueryBuilder("participation");

    // Get overall stats
    const overallStats = await baseQuery
      .select("COUNT(DISTINCT participation.user)", "uniqueParticipants")
      .addSelect("COUNT(*)", "totalParticipations")
      .addSelect("SUM(participation.amount)", "totalAmount")
      .getRawOne();

    // Get stats per phase
    const phaseQuery = baseQuery
      .select("participation.phase", "phase")
      .addSelect("COUNT(DISTINCT participation.user)", "uniqueParticipants")
      .addSelect("COUNT(*)", "totalParticipations")
      .addSelect("SUM(participation.amount)", "totalAmount")
      .groupBy("participation.phase");

    if (phase !== undefined) {
      phaseQuery.andWhere("participation.phase = :phase", { phase });
    }

    const phaseStats = await phaseQuery.getRawMany();

    return {
      phaseStats: phaseStats.map((stats) => ({
        phase: parseInt(stats.phase),
        uniqueParticipants: parseInt(stats.uniqueParticipants) || 0,
        totalParticipations: parseInt(stats.totalParticipations) || 0,
        totalAmount: BigInt(stats.totalAmount || 0).toString(),
      })),
      totalUniqueParticipants: parseInt(overallStats.uniqueParticipants) || 0,
      totalParticipations: parseInt(overallStats.totalParticipations) || 0,
      totalAmount: BigInt(overallStats.totalAmount || 0).toString(),
    };
  }

  @Query(() => [PhaseParticipationStats])
  async getPhaseStats(
    @Arg("phase", () => Int, { nullable: true }) phase?: number
  ): Promise<PhaseParticipationStats[]> {
    const manager = await this.tx();

    const query = manager
      .getRepository(Participation)
      .createQueryBuilder("participation")
      .select("participation.phase", "phase")
      .addSelect("COUNT(DISTINCT participation.user)", "uniqueParticipants")
      .addSelect("COUNT(*)", "totalParticipations")
      .addSelect("SUM(participation.amount)", "totalAmount")
      .groupBy("participation.phase");

    if (phase !== undefined) {
      query.andWhere("participation.phase = :phase", { phase });
    }

    const stats = await query.getRawMany();

    return stats.map((stat) => ({
      phase: parseInt(stat.phase),
      uniqueParticipants: parseInt(stat.uniqueParticipants) || 0,
      totalParticipations: parseInt(stat.totalParticipations) || 0,
      totalAmount: BigInt(stat.totalAmount || 0).toString(),
    }));
  }
}
