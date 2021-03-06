# Earthquake Messages Visualization App (VAST CHALLENGE 2019)

### Application Deploy
The application on Express (Node js) is deployed to Heroku. The automatic deploy (CI/CD) works with Github Actions. The application runs on https://rescuemark-app.herokuapp.com/.

### App Description

The visual analytics tool enables emergency responders to monitor the ten major resources and threats in the community. These are food, gas, medical assistance, nuclear radiation, power supply, rescue teams, transport infrastructure, sewer system, shelters and housing, and volunteers. The sunburst diagram in the left section of the dashboard displays the percentage of messages related to these categories. By default, the distribution for the entire city is plotted. It can optionally be filtered by district.

The districts are accessible via the city map in the center of the dashboard. The color of the districts encodes the number of damage reports sent from there. At the bottom, there is a slider that visualizes the overall message activity of St. Himark over time. Operators can select a specific time range for analysis. Important events are highlighted by the colored dots. Below the sunburst diagram, word clouds allow users to observe trend topics in the form of frequent terms and hashtags. These are also filtered by district if desired. The right panel lists important events for St. Himark. Clicking one of the events shifts the time frame accordingly, so information related to this point in time are being shown. The buttons in the top bar are the access points for the operators to read the original messages. They are divided into messages that were identified to be directly related to the disaster situation and those that belong to more general topics. We called this “voice of the community”. The district filter also applies to the messages.
