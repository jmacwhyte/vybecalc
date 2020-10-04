var Vybe = {
    Stats: {
        Total: "",
        Staked: "",
        Rate: "",
        Pool: "",
        Dev: ""
    },
    AllVybe: document.getElementById("allvybe"),
    Rewards: document.getElementById("rewards"),
    NewRewards: document.getElementById("newrewards"),
    MyStake: document.getElementById("mystake"),
    AddStake: document.getElementById("addstake"),

    Load: async function () {
        let response = await fetch("https://script.googleusercontent.com/macros/echo?user_content_key=ZGSqfypKVc8Cz7NjoBFjQZWByF09r6nw18nT1xJgdBrR6yl8bqta_pBNRGrgfsVvtAAD7vy_YQ97j-iVSb39dpwA4LbJk5wzm5_BxDlH2jW0nuo2oDemN9CCS2h10ox_1xSncGQajx_ryfhECjZEnFHonSFmiw2Ci8COw7AERjXyZ-dCoDB7x6Jd9Uc5jZx9b0CwV7La4qjEaV5J3l6gbjT5J-DRl3lU&lib=Mk3uQM45ouZD1H-KyIcOpQnY_oMzZeP9Y");
        if (response.ok) {
            let json = await response.json();
            if (isNaN(json.total) || isNaN(json.staking)) {
                Vybe.Fail("Couldn't get Vybe stats.")
            } else {
                console.log("Updated Vybe supply (" + json.total + " / " + json.staking + ")");
                Vybe.Stats.Total = json.total;
                Vybe.Stats.Staked = json.staking;

                // Update stats
                let months = Math.floor((new Date() - new Date("Sep-10-2020 06:42:01 AM")) / (60000 * 60 * 24 * 30))
                Vybe.Stats.Rate = 1 / Math.min(20 + (months * 5), 50);
                
                Vybe.Stats.Pool = Vybe.Stats.Total * Vybe.Stats.Rate;
                Vybe.Stats.Dev = Vybe.Stats.Pool / 20;

                // Update our display
                let s = Vybe.Stats;
                let f = Vybe.FormatNumber;
                Vybe.AllVybe.innerHTML =
                    f(s.Total, 0) + "<br>" +
                    f(s.Staked, 0) + "<br>" +
                    (s.Rate * 100).toFixed(2) + "%<br>" +
                    f(s.Pool, 0) + "<br>" +
                    f(s.Dev, 0);
                
                // Update our user's display info
                Vybe.UpdateYourVybe();
            }
        }
    },
    
    UpdateYourVybe: function () {
        let emptystate = "-- per second<br>-- per minute<br>-- per hours<br>-- per day";

        let mystake = Vybe.MyStake.value;
        if (isNaN(mystake) || Vybe.Stats.Total == "") {
            Vybe.Rewards.innerHTML = emptystate;
            Vybe.NewRewards.innerHTML = emptystate;
            return
        }

        let s = Vybe.Stats;
        
        let perday = s.Pool * (mystake / s.Staked) / 30;
        let perhour = perday / 24;
        let perminute = perhour / 60;
        
        let f = Vybe.FormatNumber;
        Vybe.Rewards.innerHTML = f(perminute, 2) + " per minute<br>" + f(perhour, 2) + " per hour<br>" + f(perday, 2) + " per day";

        let addstake = Vybe.AddStake.value;
        if (isNaN(addstake)) {
            Vybe.NewRewards.innerHTML = emptystate;
            return
        }

        let newperday = s.Pool * ((Number(mystake) + Number(addstake)) / (Number(s.Staked) + Number(addstake))) / 30;
        
        let newperhour = newperday / 24;
        let newperminute = newperhour / 60;

        Vybe.NewRewards.innerHTML =
            f(newperminute, 2) + " per minute (+" + f(newperminute - perminute, 2) + ")<br>" +
            f(newperhour, 2) + " per hour (+" + f(newperhour - perhour, 2) + ")<br>" +
            f(newperday, 2) + " per day (+" + f(newperday - perday, 2) + ")";
    },

    Fail: function (msg) {
        window.alert(msg + " Maybe try a refresh?");
    },

    FormatNumber: function (num, fixed) {
        if (num < 0.01) return "<0.01"
        return num.toFixed(fixed).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
};

Vybe.MyStake.onchange = Vybe.UpdateYourVybe;
Vybe.AddStake.onchange = Vybe.UpdateYourVybe;
Vybe.Load();