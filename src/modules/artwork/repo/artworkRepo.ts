import models, { OrmType } from "../../../shared/infra/db/orm/createModel";
import { ArtistId } from "../../artist/domain/artistId";
import { Artwork } from "../domain/artwork";
import { ArtworkId } from "../domain/artworkId";
import { ArtworkVotes } from "../domain/artworkVotes";
import { ArtworkMapper } from "../mapper/artworkMapper";
import { artworkVoteRepo } from "./artworkVoteRepo";

export interface ArtworkRepoProps {
  findOneArtwork(artworkId: string | ArtworkId): Promise<Artwork>;
  findArtistArtworks(artistId: string | ArtistId): Promise<Artwork[]>;
  save(artwork: Artwork): Promise<void>;
  exist(artworkId: string | ArtworkId): Promise<boolean>;
  findLatestArtworks(): Promise<Artwork[]>;
}

export class ArtworkRepo implements ArtworkRepoProps {
  constructor(private model: OrmType) {}

  async findOneArtwork(artworkId: ArtworkId | string): Promise<Artwork> {
    const artworkModel = this.model.artworkModel;

    const id =
      typeof artworkId === "string" ? artworkId : artworkId.id.toString();

    const artwork = await artworkModel.findOne({ where: { artwork_id: id } });

    if (!!artwork === false || artwork.length == 0)
      throw new Error("Artist Not Found!");

    return ArtworkMapper.toDomain(artwork[0]) as Artwork;
  }

  async findArtistArtworks(artistId: ArtworkId | string): Promise<Artwork[]> {
    const artworkModel = this.model.artworkModel;

    const id = typeof artistId === "string" ? artistId : artistId.id.toString();
    const artworks = await artworkModel.findOne({
      where: { artwork_owner_id: id },
    });
    return artworks.map((a: any) => ArtworkMapper.toDomain(a));
  }

  async exist(artworkId: string | ArtworkId): Promise<boolean> {
    const artworkModel = this.model.artworkModel;
    const id =
      typeof artworkId === "string" ? artworkId : artworkId.id.toString();
    const artwork = await artworkModel.findOne({ where: { artwork_id: id } });
    return !!artwork[0] === true;
  }

  async save(artwork: Artwork): Promise<void> {
    const artworkModel = this.model.artworkModel;
    const isExist = await this.exist(artwork.artworkId);
    if (!isExist) {
      const rawArtwork = ArtworkMapper.toPersistence(artwork);
      await artworkModel.create(rawArtwork);
    }
  }

  async findLatestArtworks(): Promise<Artwork[]> {
    const artworkModel = this.model.artworkModel;
    const artworks = await artworkModel.findAndSort({
      sort: { artwork_publish_date: -1 },
    });
    return artworks;
  }
}

export const artworkRepo = new ArtworkRepo(models);
