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
    // "This is not something we will be able to do. THe NODE_ENV=production is required to build the admin panel correctly. It doesn’t recognize other env variables."
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

  const doErrorProcesses = (errorMessage: string) => {
    setError(errorMessage);
    setDeployType(false);
    setBuildStatus(false);
  };

  const doNewDeploy = async (env: "production" | "staging") => {
    setBuildStatus("BUILDING");
    setDeployType(env);
    const res: any = await fetch(
      `${getApiUrlBase()}${DEPLOY_ENDPOINT}?env=${env}`
    ).catch((e) => {
      doErrorProcesses(e.message);
      return;
    });

    if (!res?.ok) {
      doErrorProcesses(res?.statusText);
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

  const containerStyle = {
    width: "80%",
    maxWidth: "600px",
    margin: "75px 0 0 75px",
    color: "white",
  };

  const buttonStyle = {
    border: "solid white",
    padding: "5px",
    backgroundColor: "grey",
    display: "block",
    marginBottom: "10px",
  };

  const h2Style = {
    fontSize: "1.5em",
    marginBottom: "0.8em",
    lineHeight: "1.3em",
  };

  const h4Style = {
    fontSize: "1.1em",
    marginBottom: "0.6em",
    lineHeight: "1.25em",
  };

  const pStyle = {
    marginBottom: "0.6em",
    lineHeight: "1.25em",
  };

  const ulStyle = {
    marginTop: "0.6em",
    marginBottom: "0.6em",
  };

  const liStyle = {
    marginLeft: "1em",
    marginBottom: "0.6em",
  };

  const bStyle = {
    fontWeight: "bold",
  };

  return (
    <div style={containerStyle}>
      <h2 style={h2Style}>
        Welcome to the Team Ted Tile Content Management System and Build Panel!
      </h2>
      <p style={pStyle}>
        Here, you can change much of the site content, and you can "build" the
        site to make those changes live.
      </p>
      <p style={pStyle}>
        You can change items by clicking the "Content Manager" link in the
        sidebar to the left. From the sub-bar from there you can link to the
        different content controls. The items you can change include:
        <ul style={ulStyle}>
          <li style={liStyle}>
            <b style={bStyle}>• Gallery Content</b>: Change Gallery items from
            the Gallery Image Collection Type link in the left sub-sidebar. The
            images are required to have a Title and an Image and note: THE IMAGE
            TITLE WILL BECOME ITS URL. It's best if it's something human
            readable for the search engines. Also note: the image that you
            upload does not have to have any particular file name. (In the past
            version of this site, the image's name was used as its url.) Other
            than the image you can add a Copyright and "tedHeadText" (lol) which
            adds the little popover caption that has Ted's head as the icon
          </li>
          <li style={liStyle}>
            <b style={bStyle}>• About Page content</b>
          </li>
          <li style={liStyle}>
            <b style={bStyle}>• Contact Page copy</b>
          </li>
        </ul>
      </p>
      <p style={pStyle}>
        The final version of the site is built, meaning even though the content
        data is determined from this CMS and is obviously variable, the site's
        user won't have to wait for the browser to call this server (Like
        Wordpress, etc.) to get that data because in the build process we turn
        it back into static pages, and we serve that to the user. The process to
        do that is enacted from the two links below. The "Build Test" action
        will build to a test url so you can see how your changes look and get
        everything how you want. Do that as much as needed until that's the case
        and then go ahead and "Build Live" and it will deploy the build to the
        live url
      </p>
      <hr style={{ marginTop: "35px" }}></hr>
      <h2 style={h2Style}>Deployment Actions</h2>

      {buildEnvIsReady && (
        <button onClick={() => doNewDeploy("staging")} style={buttonStyle}>
          Build Test Version
        </button>
      )}
      {deployType === "staging" && buildStatus && (
        <p style={{ color: "red", fontWeight: "bold" }}>{buildStatus}</p>
      )}
      {stagingUrl && (
        <p style={pStyle}>
          Preview Url:{" "}
          <a target="_blank" rel="noreferrer" href={`https://${stagingUrl}`}>
            {`https://${stagingUrl}`}
          </a>
        </p>
      )}
      {error && <p>Error: {error}</p>}

      {buildEnvIsReady && (
        <button onClick={() => doNewDeploy("production")} style={buttonStyle}>
          Build Live Version
        </button>
      )}
      {deployType === "production" && buildStatus && (
        <p style={{ color: "red", fontWeight: "bold" }}>{buildStatus}</p>
      )}
      {prodUrl && (
        <p style={pStyle}>
          <b style={bStyle}>
            Success! New version is live at the production url:
          </b>
          <br></br>
          <a target="_blank" rel="noreferrer" href={`https://${prodUrl}`}>
            {`https://${prodUrl}`}
          </a>
        </p>
      )}

      {error && <p>Error: {error}</p>}
      <h4 style={h4Style}>TODO: revert to most recent production version</h4>
    </div>
  );
}

export default HomeSplash;
