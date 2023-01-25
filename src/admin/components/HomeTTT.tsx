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
  const [currentProdDeployURL, setCurrentProdDeployURL] = useState<string>("");
  const [currentProdDeployTime, setCurrentProdDeployTime] =
    useState<string>("");
  const CHECK_BUILD_ENVIRONMENT_READY_ENDPOINT =
    "/build/get-build-environment-is-ready";
  const GET_CURRENT_PROD_DEPLOY_ENDPOINT = "/build/get-current-prod-deploy";
  const DEPLOY_ENDPOINT = "/build";

  const getApiUrlBase = useCallback(() => {
    // https://forum.strapi.io/t/not-able-to-access-dotenv-variables-in-the-strapi-admin-front-end-for-different-envs-5599/1751
    // "This is not something we will be able to do. THe NODE_ENV=production is required to build the admin panel correctly. It doesn’t recognize other env variables."
    // return process.env.NODE_ENV === "development"
    //   ? "http://localhost:1337"
    //   : "https://api.teamtedtile.com";

    // @TODO this won't work because it's localhost on prod too
    // return window?.location.hostname === "localhost"
    //   ? "http://localhost:1337/api"
    //   : "https://api.teamtedtile.com/api";
    return "http://localhost:1337/api";
    // return "https://api.teamtedtile.com/api";
  }, []);

  const getBuildEnvIsReady = useCallback(async () => {
    const res = await fetch(
      `${getApiUrlBase()}${CHECK_BUILD_ENVIRONMENT_READY_ENDPOINT}`
    ).catch((e) => {});
    if (res && res.ok) {
      return await res.json();
    }
  }, [getApiUrlBase, CHECK_BUILD_ENVIRONMENT_READY_ENDPOINT]);

  const getCurrentProdDeploy = useCallback(async () => {
    const res = await fetch(
      `${getApiUrlBase()}${GET_CURRENT_PROD_DEPLOY_ENDPOINT}`
    ).catch((e) => {});
    if (res && res.ok) {
      return await res.json();
    }
    return null;
  }, [getApiUrlBase, GET_CURRENT_PROD_DEPLOY_ENDPOINT]);

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
    getCurrentProdDeploy()
      .then((currentProdDeploy) => {
        setBuildEnvIsReady(Boolean(currentProdDeploy));
        setCurrentProdDeployURL(currentProdDeploy.alias[0]);
        setCurrentProdDeployTime(
          new Date(currentProdDeploy.createdAt).toLocaleString()
        );
      })
      .catch((e) => {
        setBuildEnvIsReady(null);
        setError(e.message);
      });
  }, [getCurrentProdDeploy]);

  const containerStyle = {
    width: "90%",
    maxWidth: "600px",
    padding: "10px",
    margin: "50px 0 50px 30px",
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

  // const aStyle = {
  //   textDecoration: "underline",
  //   color: "blue",
  //   pointer: "cursor",
  // }

  return (
    <div style={containerStyle}>
      <h2 style={h2Style}>Welcome!</h2>
      <p style={pStyle}>
        This is the Team Ted Tile{"\n"}Content Management System and Build
        Panel. Here, you can change much of the site content, and you can
        "build" the site to make those changes live.
      </p>
      <p style={pStyle}>
        You can change items by clicking the "Content Manager" link in the
        sidebar to the left. From the sub-bar from there you can link to the
        different content controls. The items you can change include:
        <ul style={ulStyle}>
          <li style={liStyle}>
            • Gallery Content: Change Gallery items from the Gallery Image
            Collection Type link in the left sub-sidebar. The images are
            required to have a Title and an Image and note: THE IMAGE TITLE WILL
            BECOME ITS URL. It's best if it's something human readable for the
            search engines. Also note: the image that you upload does not have
            to have any particular file name. (In the past version of this site,
            the image's name was used as its url.) Other than the image you can
            add a Copyright and "tedHeadText" (lol) which adds the little
            popover caption that has Ted's head as the icon
          </li>
          <li style={liStyle}>• About Page content</li>
          <li style={liStyle}>• Contact Page copy</li>
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
      <h2 style={h2Style}>Current Deployments</h2>
      {currentProdDeployURL && (
        <p style={pStyle}>
          <a
            href={`https://${currentProdDeployURL}`}
            target="_blank"
            rel="noreferrer"
          >
            {currentProdDeployURL}
          </a>
        </p>
      )}
      {currentProdDeployTime && (
        <p style={pStyle}>Built at: {currentProdDeployTime}</p>
      )}
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
      <hr style={{ marginTop: "35px" }}></hr>
      <h4 style={h4Style}>Ted!! I will remove this section eventually...</h4>
      <p style={pStyle}>
        For now, we can use it to keep track of TODO items. I'll add all the
        things I'm thinking about doing/fixing before we go live with this
        version of things. This is for both this cms as well as for the site
        itself (I rebuilt that as well).
      </p>
      <p style={pStyle}>
        Please, as you have the chance to review any of this, again both this
        CMS as well as the site, make notes of things you see are broken
        (nothing too small even if you think I probably already know about it)
        or also make notes of things you may want to change. Now's the time, I
        may not get a chance to work on this for another 5 years lol. You can
        send me an email and I can port them into this place or just do them.
      </p>
      <p style={pStyle}>Ok, so here's things I know I need to do</p>
      <ul style={ulStyle}>
        <li style={liStyle}>
          • CMS: make a "revert to most recent working production version"
          button
        </li>
        <li style={liStyle}>• SITE: make slideshow swipeable on devices</li>
        <li style={liStyle}>• SITE: contact form validation</li>
        <li style={liStyle}>• SITE: google analytics events</li>
      </ul>
      <h4 style={h4Style}>A question for you Ted:</h4>
      <ul style={ulStyle}>
        <li style={liStyle}>
          • How are you feeling about the Facebook and Twitter links out? I can
          check the data (maybe) about usage, but have you ever seen any of your
          work posted over to those sites, especially via your website? If it's
          not happening it may be cleaner to remove them. If you want it to
          happen we could probably push it somehow. I haven't currently done the
          implementation work in the new site instance.
        </li>
      </ul>
    </div>
  );
}

export default HomeSplash;
