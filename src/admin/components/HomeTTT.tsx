import React, { useCallback, useEffect, useState } from "react";

function HomeSplash() {
  const [stagingUrl, setStagingUrl] = useState<string | null>(null);
  const [prodUrl, setProdUrl] = useState<string | null>(null);
  const [buildStatus, setBuildStatus] = useState<boolean | string>(false);
  const [deployType, setDeployType] = useState<
    boolean | "production" | "staging"
  >(false);
  const [error, setError] = useState<string | null>(null);
  const [buildEnvIsReady, setBuildEnvIsReady] = useState<boolean>(false);
  const CHECK_BUILD_ENVIRONMENT_READY_ENDPOINT =
    "/build/get-build-environment-is-ready";
  const DEPLOY_ENDPOINT = "/build";

  const getApiUrlBase = useCallback(() => {
    // https://forum.strapi.io/t/not-able-to-access-dotenv-variables-in-the-strapi-admin-front-end-for-different-envs-5599/1751
    // This is not something we will be able to do. THe NODE_ENV=production is required to build the admin panel correctly. It doesn’t recognize other env variables.
    // return process.env.NODE_ENV === "development"
    //   ? "http://localhost:1337"
    //   : "https://api.teamtedtile.com";
    return window?.location.hostname === "localhost"
      ? "http://localhost:1337/api"
      : "https://api.teamtedtile.com/api";
  }, []);

  const getBuildEnvIsReady = useCallback(async () => {
    const res = await fetch(
      `${getApiUrlBase()}${CHECK_BUILD_ENVIRONMENT_READY_ENDPOINT}`
    ).catch((e) => {});
    if (res && res.ok) {
      return await res.json();
    }
  }, [getApiUrlBase, CHECK_BUILD_ENVIRONMENT_READY_ENDPOINT]);

  const doNewDeploy = async (env: "production" | "staging") => {
    setBuildStatus("BUILDING");
    setDeployType(env);
    const res: any = await fetch(
      `${getApiUrlBase()}${DEPLOY_ENDPOINT}?env=${env}`
    ).catch((e) => {
      setError(e.message);
      setDeployType(false);
      setBuildStatus(false);
      return;
    });

    if (!res?.ok) {
      setError(res?.statusText);
      setDeployType(false);
      setBuildStatus(false);
      return;
    }
    const decodedData = await res.json();
    switch (env) {
      case "production":
        // @TODO leave for now, not sure how the custom url will appear, so change then
        setProdUrl(`${decodedData.name}.vercel.app`);
        break;
      case "staging":
        setStagingUrl(decodedData.url);
        break;
    }
    setDeployType(false);
    setBuildStatus(false);
  };

  useEffect(() => {
    getBuildEnvIsReady()
      .then((isReady) => {
        setBuildEnvIsReady(isReady);
      })
      .catch((e) => {
        setBuildEnvIsReady(null);
        setError(e.message);
      });
  }, [getBuildEnvIsReady]);

  const buttonStyle = {
    border: "solid white",
    padding: "5px",
    backgroundColor: "grey",
    display: "block",
  };

  return (
    <div
      style={{
        width: "80%",
        maxWidth: "600px",
        margin: "75px 0 0 75px",
        color: "white",
      }}
    >
      <h2>Welcome to the Team Ted Tile control panel!</h2>
      <p>
        Here, you can change much of the site content. You can change items by
        clicking the "Content Manager" link in the sidebar to the left. From the
        sub-bar from there you can link to the different contrent controls. The
        items you can change include:<br></br>
        <ul>
          <li>
            <b>Gallery Content</b>
            <br></br>
            change Gallery Items from the Gallery Image Collection Type link in
            the left sub-sidebar. The images are required to have a title and an
            image and note: THE IMAGE TITLE WILL BECOME ITS URL. It's best if
            it's something human readable for the search engines. Also note: the
            image that you upload does not have to have any particular file
            name. (In the past version of this site, the image's name was used
            as its url.) Other than the image you can add a copyright and
            "tedHeadText" (lol) which adds the little popover caption that has
            Ted's head as the icon
          </li>
          <li>
            <b>About Page Content</b>
          </li>
          <li>
            <b>Contact Page copy</b>
          </li>
        </ul>
      </p>
      <p>
        The final version of the site is "built" meaning even though the content
        data is determined from this CMS and is obviously variable, the site's
        user won't have to wait for the browser to call this server to get that
        data because in the build process we turn it back into static pages. The
        process to do that is enacted from the two links below. The "Build Test"
        action will build to a test url so you can see how your changes look and
        get everything how you want. Do that as much as needed until that's the
        case and then go ahead and "Build Live" and it will deploy the build to
        the live url
      </p>
      <hr style={{ marginTop: "35px" }}></hr>
      <h2>Deployment Actions</h2>
      {/* <h4>Deploy to test environment</h4> */}
      {buildEnvIsReady && (
        <button onClick={() => doNewDeploy("staging")} style={buttonStyle}>
          Build Test Version
        </button>
      )}
      {deployType === "staging" && buildStatus && (
        <p style={{ color: "red", fontWeight: "bold" }}>{buildStatus}</p>
      )}
      {stagingUrl && (
        <p>
          Preview Url:{" "}
          <a target="_blank" rel="noreferrer" href={`https://${stagingUrl}`}>
            {`https://${stagingUrl}`}
          </a>
        </p>
      )}
      {error && <p>Error: {error}</p>}

      {/* <hr style={{ marginTop: "35px" }}></hr> */}

      {/* <h4>Deploy to production</h4> */}
      {buildEnvIsReady && (
        <button onClick={() => doNewDeploy("production")} style={buttonStyle}>
          Build Live Version
        </button>
      )}
      {deployType === "production" && buildStatus && (
        <p style={{ color: "red", fontWeight: "bold" }}>{buildStatus}</p>
      )}
      {prodUrl && (
        <p>
          <b>Success! New version is live at the production url:</b>
          <br></br>
          <a target="_blank" rel="noreferrer" href={`https://${prodUrl}`}>
            {`https://${prodUrl}`}
          </a>
        </p>
      )}
      {error && <p>Error: {error}</p>}
      <h4>TODO: revert to most recent production version</h4>
    </div>
  );
}

export default HomeSplash;
