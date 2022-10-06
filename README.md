TODO: UPDATE DOCS. This is a boilerplate app with just having one config field in the app and displaying the config in custom field, sidebar widget and dashboard widget ui locations. This also has a sample server api for webhooks that are triggered from app during the publish event of an entry.

<h1>TODO: UPDATE DOCS</h1>

<h2>Prerequisites</h2>
Nodejs - v14.18.2<br/>
NPM - 8.1.4<br/>

<h2>Setting up app repo with package dependencies</h2>

1. Boilerplate source folder will be referred as APP_DIRECTORY from now on.

2. In the APP_DIRECTORY, update this Readme.md file as per your requirement.

3. Go to **&lt;APP_DIRECTORY&gt;/ui** directory in terminal and execute following command `npm i`

4. If the app does not require any api to be available, then remove the contents of **&lt;APP_DIRECTORY&gt;/api** directory.

5. If the app requires api, then go to **&lt;APP_DIRECTORY&gt;/api** directory in terminal and execute following command `npm i`

<h2>Naming the app and updating assets</h2>

6. Open the package.json inside the APP_DIRECTORY (&lt;APP_DIRECTORY&gt;/package.json) and update the name attribute to your app name.

7. Open the package.json inside the ui app (&lt;APP_DIRECTORY&gt;/ui/package.json) and update the name attribute to your app name. Open the package-lock.json inside the ui app (&lt;APP_DIRECTORY&gt;/ui/package-lock.json) and update the name attribute to your app name.

8. Open the root html file of app (available at &lt;APP_DIRECTORY&gt;/ui/public/index.html) and update the &lt;title&gt; tag value to the name of your app.

9. Change the favicon.ico as per the requirement of your app. favicon.ico file is available at &lt;APP_DIRECTORY&gt;/ui/public/favicon.ico.

<h2>Starting the UI and API Servers</h2>

11. Go to **&lt;APP_DIRECTORY&gt;/ui** directory in terminal and start the ui react server by running `npm run dev`. The UI server will start at port 3000.

12. Go to **&lt;APP_DIRECTORY&gt;/api** directory in terminal and start the server by running `npm run dev`. The API server will start at port 8000.

<h2>Creating and updating app in ContentStack</h2>

13. Refer https://www.contentstack.com/docs/developers/developer-hub/guide-to-build-your-first-simple-app/ to learn how to create apps.

14. Go to the Developer hub in https://app.contentstack.com and select the NEW_APP. On the top right click on Install App.

15. Select the required stack where the app should get installed.

<h2>Developing the app and debugging the changes</h2>

16. After the app is installed in the stack, you can refer the pages developed at various UI locations.
    Below are the various UI locations and their corresponding page in source code:

| UI Location      | Page Source                                                       |
| ---------------- | ----------------------------------------------------------------- |
| Config Screen    | &lt;APP_DIRECTORY&gt;/ui/src/containers/ConfigScreen/index.tsx    |
| Sidebar Widget   | &lt;APP_DIRECTORY&gt;/ui/src/containers/SidebarWidget/index.tsx   |
| Dashboard Widget | &lt;APP_DIRECTORY&gt;/ui/src/containers/DashboardWidget/index.tsx |
| Custom Field     | &lt;APP_DIRECTORY&gt;/ui/src/containers/CustomField/index.tsx     |

17. You can change the source codes and refer the changes in UI now at corresponding places as mentioned above. Once developed as expected, commit the changes to your repo.

<h2>Building and Deploying the app</h2>

18. To build the app, run build.sh shell script in your terminal. In your terminal go to APP_DIRECTORY and execute `sh build.sh`

19. The build output will be two zip files - one for api and other for ui. The output will be inside to-deploy folder. Build outputs are:<br/>
    **&lt;APP_DIRECTORY&gt;/to-deploy/api.zip**<br/>
    **&lt;APP_DIRECTORY&gt;/to-deploy/ui.zip**

20. The api.zip can be deployed in AWS Lambda or any other similar services and API gateway trigger can be enabled for that deployment.

21. The ui.zip is static ui build of react app, which can be deployed in any static serving deployments like AWS S3 and Cloudfront or any other similar service providers.

22. Once you deploy the ui and api of app, you can update the base url and webhook target url in the app via developerhub.
