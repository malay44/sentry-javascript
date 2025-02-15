/* eslint-disable no-console */
const SentryCli = require('@sentry/cli');

const { deleteSourcemaps } = require('./deleteSourcemaps');

const sentry = new SentryCli();

async function createRelease(argv, URL_PREFIX, BUILD_PATH) {
  let release;

  if (!argv.release) {
    try {
      release = await sentry.releases.proposeVersion();
    } catch (error) {
      console.warn('[sentry] Failed to propose a release version.');
      console.warn('[sentry] You can specify a release version with `--release` flag.');
      console.warn('[sentry] For example: `sentry-upload-sourcemaps --release 1.0.0`');
      throw error;
    }
  } else {
    release = argv.release;
  }

  await sentry.releases.new(release);

  await sentry.releases.uploadSourceMaps(release, {
    urlPrefix: URL_PREFIX,
    include: [BUILD_PATH],
    useArtifactBundle: !argv.disableDebugIds,
  });

  await sentry.releases.finalize(release);

  if (argv.deleteAfterUpload) {
    try {
      deleteSourcemaps(BUILD_PATH);
    } catch (error) {
      console.warn(`[sentry] Failed to delete sourcemaps in build directory: ${BUILD_PATH}`);
      console.error(error);
    }
  }
}

module.exports = {
  createRelease,
};
