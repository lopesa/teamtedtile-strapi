import React, { useCallback, useEffect, useMemo, useState } from "react";

function HomeSplash() {
  const [stagingUrl, setStagingUrl] = useState<string | null>(null);
  const [prodUrl, setProdUrl] = useState<string | null>(null);
  const [buildStatus, setBuildStatus] = useState<boolean | string>(false);
  const [deployType, setDeployType] = useState<
    boolean | "production" | "staging"
  >(false);
  const [error, setError] = useState<string | null>(null);
  const [currentProdDeployDetails, setCurrentProdDeployDetails] =
    useState<any>(null);
  const vercelToken = process.env.REACT_APP_VERCEL_TOKEN;
  const TTT_VERCEL_PROJECT_ID = process.env.REACT_APP_TTT_VERCEL_PROJECT_ID;
  const GET_CURRENT_DEPLOYS_ENDPOINT = "https://api.vercel.com/v6/deployments";

  const MAKE_DEPLOY_API_ENDPT = "https://api.vercel.com/v13/deployments";
  const GET_DEPLOY_DETAILS_API_ENDPT =
    "https://api.vercel.com/v13/deployments/";

  const DEPLOY_STATUS_CHECK_MAX_TRIES = 30;
  const DEPLOY_STATUS_CHECK_WAIT_TIME = 2000;

  const doFetch = async (endpoint: string, config: any) => {
    const response = await fetch(endpoint, config);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const decodedData = await response.json();
    if (decodedData.error) {
      throw new Error(decodedData.error.message);
    }
    return decodedData;
  };

  const GENERIC_CONFIG = useMemo(() => {
    return {
      headers: {
        Authorization: "Bearer " + vercelToken,
      },
    };
  }, [vercelToken]);

  const getCurrentProdDeploy = useCallback(async () => {
    const filterOutCurrentProdDeploy = (decodedData: any) => {
      return decodedData.deployments
        .filter(
          (item: any) => item.target === "production" && item.state === "READY"
        )
        .sort((a: any, b: any) => b.createdAt - a.createdAt)[0];
    };
    const config = {
      method: "get",
      ...GENERIC_CONFIG,
    };
    let endpoint = `${GET_CURRENT_DEPLOYS_ENDPOINT}?projectId=${TTT_VERCEL_PROJECT_ID}`;
    let decodedData = await doFetch(endpoint, config);
    let currentProdDeploy = filterOutCurrentProdDeploy(decodedData);
    if (!currentProdDeploy && decodedData.pagination?.next) {
      let nextPageTimestamp = decodedData.pagination.next;
      while (!currentProdDeploy && nextPageTimestamp) {
        endpoint = `${GET_CURRENT_DEPLOYS_ENDPOINT}?projectId=${TTT_VERCEL_PROJECT_ID}&from=${nextPageTimestamp}`;
        decodedData = await doFetch(endpoint, config);
        currentProdDeploy = filterOutCurrentProdDeploy(decodedData);
      }
    }
    return currentProdDeploy;
  }, [GENERIC_CONFIG, TTT_VERCEL_PROJECT_ID]);

  const getCurrentProdDeployDetails = useCallback(async () => {
    const currentProdDeploy = await getCurrentProdDeploy().catch((e) => {
      throw e;
    });

    if (!currentProdDeploy) {
      throw new Error("No current production deploy found.");
    }

    const config = {
      method: "get",
      ...GENERIC_CONFIG,
    };
    const endpoint = `${GET_DEPLOY_DETAILS_API_ENDPT}${currentProdDeploy.uid}`;
    const decodedData = await doFetch(endpoint, config);
    return decodedData;
  }, [GENERIC_CONFIG, getCurrentProdDeploy]);

  const checkDeployStatusAction = async (deployId: string) => {
    const config = {
      method: "get",
      ...GENERIC_CONFIG,
    };
    const endpoint = `${GET_DEPLOY_DETAILS_API_ENDPT}${deployId}`;
    const decodedData = await doFetch(endpoint, config);
    return decodedData;
  };

  const checkDeployStatus = (deployId: string) => {
    return new Promise((resolve, reject) => {
      let tries = 0;
      const interval = setInterval(async () => {
        const deployInfo = await checkDeployStatusAction(deployId).catch(
          (e) => {
            resolve("error");
            clearInterval(interval);
          }
        );
        if (deployInfo.status === "READY") {
          resolve("built");
          clearInterval(interval);
        } else if (deployInfo.status === "ERROR") {
          resolve("error");
          clearInterval(interval);
        } else {
          setBuildStatus(deployInfo.status);
        }
        if (++tries >= DEPLOY_STATUS_CHECK_MAX_TRIES) {
          resolve("error");
          clearInterval(interval);
        }
      }, DEPLOY_STATUS_CHECK_WAIT_TIME);
    });
  };

  const doNewDeploy = async (env: "production" | "staging") => {
    if (!currentProdDeployDetails) {
      throw new Error("problem getting current deployment info");
    }
    setBuildStatus(true);
    const config = {
      body: JSON.stringify({
        name: "teamtedtile-staging",
        deploymentId: currentProdDeployDetails.id,
        gitSource: currentProdDeployDetails.gitSource,
        target: env === "production" ? "production" : undefined,
      }),
      headers: {
        Authorization: "Bearer " + vercelToken,
      },
      method: "post",
    };
    const decodedData = await doFetch(`${MAKE_DEPLOY_API_ENDPT}`, config);
    const buildStatus = await checkDeployStatus(decodedData.id);
    if (buildStatus === "built") {
      switch (env) {
        case "production":
          // @TODO leave for now, not sure how the custom url will appear, so change then
          setProdUrl(`${decodedData.name}.vercel.app`);
          break;
        case "staging":
          setStagingUrl(decodedData.url);
          break;
      }
    } else {
      setError("something went wrong");
    }
    setBuildStatus(false);
  };

  const doNewStagingDeploy = async () => {
    setDeployType("staging");
    doNewDeploy("staging")
      .then(() => {
        setDeployType(false);
      })
      .catch((e) => {
        setError(e.message);
        setDeployType(false);
        setBuildStatus(false);
      });
  };
  const doNewProductionDeploy = () => {
    setDeployType("production");
    doNewDeploy("production")
      .then(() => {
        setDeployType(false);
      })
      .catch((e) => {
        setError(e.message);
        setBuildStatus(false);
      });
  };

  useEffect(() => {
    getCurrentProdDeployDetails()
      .then((details) => {
        setCurrentProdDeployDetails(details);
      })
      .catch((e) => {
        setCurrentProdDeployDetails(null);
        setError(e.message);
      });
  }, [getCurrentProdDeployDetails]);

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
      {currentProdDeployDetails !== null && (
        <button onClick={doNewStagingDeploy} style={{ display: "block" }}>
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
      {currentProdDeployDetails && (
        <button
          onClick={doNewProductionDeploy}
          style={{ display: "block", marginTop: "30px" }}
        >
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
