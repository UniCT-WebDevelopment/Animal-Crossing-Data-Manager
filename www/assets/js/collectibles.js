import { authUser } from "./user.js";

const months = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
const currentMonth = new Date().getMonth();
const currentHour = new Date().getHours();

class Collectibles {
    constructor(category) {
        this.numberOfElements = (category == "sea_creatures")? 40 : 80;
        this.category = category;
        this.tableBody = document.querySelector("table > tbody");
        this.obtainedElementsField = document.querySelector("strong[data-type='obtained']")
        this.remainingElementsField = document.querySelector("strong[data-type='remaining']")
        this.progressBar = document.querySelector("progress");
        this.filterBtn = document.querySelector("#filterBtn")
        
        fetch(`assets/data/${category}.json`)
        .then(res => res.json())
        .then(categoryElements => {
            categoryElements.forEach(singleElement => this.generateTableRow(singleElement));
            this.postTableGeneration();
        });

        authUser.setUser()
        .then(() => {
            authUser.getFromCategory(category)
            .then(categoryElements => {
                categoryElements.forEach(singleElement => document.querySelector(`#${singleElement}`).checked = true);
                this.manageStats();
            })
        });

        this.filterBtn.addEventListener('click', () => {
            const shouldHideAlreadyObtained = this.filterBtn.classList.contains('is-outlined')
            this.filterBtn.classList.toggle('is-outlined');

            if (shouldHideAlreadyObtained) {
                this.tableBody.querySelectorAll("input[type='checkbox']:checked")
                .forEach(alreadyOwns => {
                    alreadyOwns.parentElement.parentElement.parentElement.classList.add('is-hidden')
                })
            } else {
                this.tableBody.querySelectorAll(".is-hidden")
                .forEach(alreadyOwns => alreadyOwns.classList.remove('is-hidden'))
            }
        })
    }

    postTableGeneration() {
        this.manageStats();
    }

    generateTableRow(singleElement) {
        const periodData = this.formatPeriod(singleElement["periods"]);
        const timeData = this.formatTime(singleElement["times"]);

        const inputLabel = document.createElement("label")
        inputLabel.setAttribute("for", singleElement["name"].replaceAll(" ", "").replace("'", ""))
        const inputCheck = document.createElement("input")
        inputCheck.classList.add("is-checkradio")
        inputCheck.setAttribute("type", "checkbox")
        inputCheck.setAttribute("id", singleElement["name"].replaceAll(" ", "").replace("'", ""))
        
        const inputDiv = document.createElement("div")
        inputDiv.classList.add("field");
        inputDiv.appendChild(inputCheck);
        inputDiv.appendChild(inputLabel);
        const th = document.createElement("th")
        th.appendChild(inputDiv);

        inputCheck.addEventListener("click", (e) => {
            authUser.changeCategoryValue(this.category, e.target.id, e.target.checked)
            this.manageStats()
        });
        
        const nameValue = document.createElement("td")
        nameValue.innerText = singleElement["name"]
        const zoneValue = document.createElement("td")
        zoneValue.innerText = singleElement["zone"]
        const periodValue = document.createElement("td")
        periodValue.classList.add(periodData[1]?"has-text-success":"has-text-danger")
        periodValue.innerText = periodData[0]
        const timeValue = document.createElement("td")
        timeValue.classList.add(timeData[1]?"has-text-success":"has-text-danger")
        timeValue.setAttribute("collectible", singleElement["name"])
        timeValue.setAttribute("data-type", "period")
        timeValue.innerText = timeData[0]

        const tr = document.createElement("tr")
        tr.append(th, nameValue, zoneValue, periodValue, timeValue);
        this.tableBody.appendChild(tr)
    }

    formatPeriod(period) {
        if (period == [] || period.length == 0) {
            return ["Sempre", true]
        } else if (period.length == 1) {
            return [period[0], months[currentMonth] == period[0]]
        }

        const parsedPeriods = []
        let isInRange = false

        for (let index=0; index<period.length; index += 2) {
            if (period[index] == period[index+1]) {
                parsedPeriods.push(`${period[index]}`);
            } else {
                parsedPeriods.push(`${period[index]} - ${period[index+1]}`);
            }

            const startPeriod = months.indexOf(period[index]);
            const endPeriod = months.indexOf(period[index+1]);

            if (startPeriod > endPeriod) {
                isInRange |= currentMonth >= startPeriod || currentMonth <= endPeriod
            } else {
                isInRange |= currentMonth >= startPeriod && currentMonth <= endPeriod
            }
        }

        return [parsedPeriods.join(", "), isInRange]
    }

    formatTime(time) {
        if (time.length == 0) {
            return ["Sempre", true]
        }

        const parsedTimes = []
        let isInRange = false

        for (let index=0; index<time.length; index += 2) {
            parsedTimes.push(`${time[index]}:00 - ${time[index+1]}:00`);

            if (time[index] > time[index+1]) {
                isInRange |= currentHour >= time[index] || currentHour < time[index+1]
            } else {
                isInRange |= currentHour >= time[index] && currentHour < time[index+1]
            }
        }

        return [parsedTimes.join(", "), isInRange]
    }

    manageStats() {
        const alreadyObtainedElements = document.querySelectorAll("input[type='checkbox']:checked").length
        this.obtainedElementsField.innerText = alreadyObtainedElements;
        this.remainingElementsField.innerText = this.numberOfElements - alreadyObtainedElements;

        this.progressBar.setAttribute("value", alreadyObtainedElements);
        this.progressBar.setAttribute("max", this.numberOfElements);
    }
}

export { Collectibles };
