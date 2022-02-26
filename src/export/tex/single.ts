import { VersionId } from '@curvenote/blocks';
import path from 'path';
import { ISession } from '../../session/types';
import { writeBibtex } from '../utils/writeBibtex';
import { makeBuildPaths } from '../utils';
import { TexExportOptions } from './types';
import {
  ifTemplateFetchTaggedBlocks,
  ifTemplateLoadOptions,
  throwIfTemplateButNoJtex,
} from './template';
import { ifTemplateRunJtex } from './utils';
import { gatherAndWriteArticleContent } from './gather';

export async function singleArticleToTex(
  session: ISession,
  versionId: VersionId,
  opts: TexExportOptions,
) {
  throwIfTemplateButNoJtex(opts);
  const { tagged } = await ifTemplateFetchTaggedBlocks(session, opts);
  const templateOptions = ifTemplateLoadOptions(opts);

  const { buildPath } = makeBuildPaths(session.log, opts);

  session.log.debug('Starting articleToTex...');
  session.log.debug(`With Options: ${JSON.stringify(opts)}`);

  const { article, filename } = await gatherAndWriteArticleContent(
    session,
    versionId,
    opts,
    tagged,
    templateOptions,
    buildPath,
  );

  session.log.debug('Writing bib file...');
  await writeBibtex(session, article.references, path.join(buildPath, 'main.bib'));

  await ifTemplateRunJtex(filename, session.log, opts);

  return article;
}
