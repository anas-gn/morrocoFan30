DROP DATABASE IF EXISTS fandb;
CREATE DATABASE fandb;
USE fandb;

CREATE TABLE Teams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  country VARCHAR(100),
  imageUrl VARCHAR(255),
  coach VARCHAR(100),
  description TEXT
);

CREATE TABLE Stades (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  capacity INT,
  country VARCHAR(100),
  description TEXT,
  videoUrl VARCHAR(255),
  imageUrl VARCHAR(255),
  address VARCHAR(255),
  dateOfConstruction DATE
  cityID INT,
  FOREIGN KEY (cityID) REFERENCES CityHosts(id) ON DELETE CASCADE
);

CREATE TABLE Supporters (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  age INT,
  email VARCHAR(150),
  phone VARCHAR(50),
  password VARCHAR(255),
  country VARCHAR(100),
  totalPoints INT DEFAULT 0,
  imageUrl VARCHAR(255)
);

CREATE TABLE CityHosts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  country VARCHAR(100),
  description TEXT,
  region VARCHAR(100)
);

CREATE TABLE Groups (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100)
);

CREATE TABLE Matches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  DateOfMatch DATETIME,
  referee VARCHAR(100),
  status VARCHAR(50),
  type VARCHAR(50),
  stadeID INT,
  treeID INT,
  FOREIGN KEY (stadeID) REFERENCES Stades(id) ON DELETE CASCADE
);

CREATE TABLE Players (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  height FLOAT,
  weight FLOAT,
  teamID INT,
  FOREIGN KEY (teamID) REFERENCES Teams(id) ON DELETE CASCADE
);

CREATE TABLE MatchTeam (
  matchID INT,
  teamID INT,
  goals INT,
  PRIMARY KEY (matchID, teamID),
  FOREIGN KEY (matchID) REFERENCES Matches(id) ON DELETE CASCADE,
  FOREIGN KEY (teamID) REFERENCES Teams(id) ON DELETE CASCADE
);

CREATE TABLE GroupTeam (
  id INT AUTO_INCREMENT PRIMARY KEY,
  wins INT,
  draws INT,
  loses INT,
  goalsScored INT,
  goalsConceded INT,
  groupID INT,
  teamID INT,
  FOREIGN KEY (groupID) REFERENCES Groups(id) ON DELETE CASCADE,
  FOREIGN KEY (teamID) REFERENCES Teams(id) ON DELETE CASCADE
);

CREATE TABLE Predictions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dateOfPrediction DATETIME,
  points INT,
  status VARCHAR(50),
  matchID INT,
  supporterID INT,
  FOREIGN KEY (matchID) REFERENCES Matches(id) ON DELETE CASCADE,
  FOREIGN KEY (supporterID) REFERENCES Supporters(id) ON DELETE CASCADE
);

CREATE TABLE Guides (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  address VARCHAR(255),
  description TEXT,
  email VARCHAR(150),
  phone VARCHAR(50),
  imageUrl VARCHAR(255),
  languages VARCHAR(255),
  cityID INT,
  FOREIGN KEY (cityID) REFERENCES CityHosts(id) ON DELETE CASCADE
);

CREATE TABLE Hotels (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  address VARCHAR(255),
  description TEXT,
  email VARCHAR(150),
  phone VARCHAR(50),
  imageUrl VARCHAR(255),
  urlReservation VARCHAR(255),
  cityID INT,
  FOREIGN KEY (cityID) REFERENCES CityHosts(id) ON DELETE CASCADE
);

CREATE TABLE Routes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  description TEXT,
  priceProxim FLOAT,
  cityID INT,
  FOREIGN KEY (cityID) REFERENCES CityHosts(id) ON DELETE CASCADE
);

CREATE TABLE Foods (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  category VARCHAR(100),
  description TEXT,
  priceProxim FLOAT,
  imageUrl VARCHAR(255),
  cityID INT,
  FOREIGN KEY (cityID) REFERENCES CityHosts(id) ON DELETE CASCADE
);

CREATE TABLE Transports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  priceProxim FLOAT,
  description TEXT,
  capacity INT,
  imageUrl VARCHAR(255),
  cityID INT,
  FOREIGN KEY (cityID) REFERENCES CityHosts(id) ON DELETE CASCADE
);

CREATE TABLE Events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  description TEXT,
  dateOfEvent DATETIME,
  priceProxim FLOAT,
  imageUrl VARCHAR(255),
  cityID INT,
  FOREIGN KEY (cityID) REFERENCES CityHosts(id) ON DELETE CASCADE
);

CREATE TABLE Attractions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  country VARCHAR(100),
  type VARCHAR(100),
  priceProxim FLOAT,
  description TEXT,
  address VARCHAR(255),
  houreOfOpening TIME,
  houreOfClosing TIME,
  cityID INT,
  FOREIGN KEY (cityID) REFERENCES CityHosts(id) ON DELETE CASCADE
);

CREATE TABLE Itineraries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150),
  description TEXT,
  dateToGo DATE,
  supporterID INT,
  attractionID INT,
  FOREIGN KEY (supporterID) REFERENCES Supporters(id) ON DELETE CASCADE,
  FOREIGN KEY (attractionID) REFERENCES Attractions(id) ON DELETE CASCADE
);

CREATE TABLE Images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  imageUrl VARCHAR(255),
  type VARCHAR(50),
  ownerID INT
);

CREATE TABLE Cultures (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150),
  author VARCHAR(100),
  description TEXT,
  detail TEXT,
  imageUrl VARCHAR(255),
  dateOfCreation DATETIME,
  teamID INT,
  FOREIGN KEY (teamID) REFERENCES Teams(id) ON DELETE CASCADE
);

CREATE TABLE News (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150),
  author VARCHAR(100),
  description TEXT,
  detail TEXT,
  imageUrl VARCHAR(255),
  dateOfCreation DATETIME,
  teamID INT,
  FOREIGN KEY (teamID) REFERENCES Teams(id) ON DELETE CASCADE
);

CREATE TABLE Reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  description TEXT,
  rating INT,
  dateOfCreation DATETIME,
  supporterID INT,
  matchID INT,
  FOREIGN KEY (supporterID) REFERENCES Supporters(id) ON DELETE CASCADE,
  FOREIGN KEY (matchID) REFERENCES Matches(id) ON DELETE CASCADE
);

CREATE TABLE Reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dateOfReport DATETIME,
  description TEXT,
  badOrGood BOOLEAN,
  imageUrl VARCHAR(255),
  supporterID INT,
  FOREIGN KEY (supporterID) REFERENCES Supporters(id) ON DELETE CASCADE
);

CREATE TABLE Favorites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dateOfAdd DATETIME,
  type VARCHAR(50),
  ownerID INT,
  supporterID INT,
  FOREIGN KEY (supporterID) REFERENCES Supporters(id) ON DELETE CASCADE
);

CREATE TABLE Messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  content TEXT,
  country VARCHAR(100),
  dateOfSend DATETIME,
  supporterID INT,
  FOREIGN KEY (supporterID) REFERENCES Supporters(id) ON DELETE CASCADE
);

CREATE TABLE Notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dateOfSend DATETIME,
  content TEXT,
  isRead BOOLEAN DEFAULT FALSE,
  supporterID INT,
  FOREIGN KEY (supporterID) REFERENCES Supporters(id) ON DELETE CASCADE
);