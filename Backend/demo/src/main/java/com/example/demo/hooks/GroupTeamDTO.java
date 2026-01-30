package com.example.demo.hooks;

public class GroupTeamDTO {

        private int id;
        private int wins;
        private int draws;
        private int loses;
        private int goalsScored;
        private int goalsConceded;
        private int teamID;
        private String teamName;
        private String teamCountry;
        private String teamImageUrl;

        public GroupTeamDTO() {
        }

    public GroupTeamDTO(int wins, int draws, int loses, int goalsScored, int goalsConceded, int teamID,
                String teamName, String teamCountry, String teamImageUrl) {
            this.wins = wins;
            this.draws = draws;
            this.loses = loses;
            this.goalsScored = goalsScored;
            this.goalsConceded = goalsConceded;
            this.teamID = teamID;
            this.teamName = teamName;
            this.teamCountry = teamCountry;
            this.teamImageUrl = teamImageUrl;
        }



    public int getTeamID() {
            return teamID;
        }



        public void setTeamID(int teamID) {
            this.teamID = teamID;
        }



        public String getTeamName() {
            return teamName;
        }



        public void setTeamName(String teamName) {
            this.teamName = teamName;
        }



        public String getTeamCountry() {
            return teamCountry;
        }



        public void setTeamCountry(String teamCountry) {
            this.teamCountry = teamCountry;
        }



        public String getTeamImageUrl() {
            return teamImageUrl;
        }



        public void setTeamImageUrl(String teamImageUrl) {
            this.teamImageUrl = teamImageUrl;
        }



    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getWins() {
        return wins;
    }

    public void setWins(int wins) {
        this.wins = wins;
    }

    public int getDraws() {
        return draws;
    }

    public void setDraws(int draws) {
        this.draws = draws;
    }

    public int getLoses() {
        return loses;
    }

    public void setLoses(int loses) {
        this.loses = loses;
    }

    public int getGoalsScored() {
        return goalsScored;
    }

    public void setGoalsScored(int goalsScored) {
        this.goalsScored = goalsScored;
    }

    public int getGoalsConceded() {
        return goalsConceded;
    }

    public void setGoalsConceded(int goalsConceded) {
        this.goalsConceded = goalsConceded;
    }

   
}