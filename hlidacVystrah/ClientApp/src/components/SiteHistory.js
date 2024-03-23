import { Last } from "../../../../node_modules/react-bootstrap/esm/PageItem";

class SiteHistory {

    constructor(CloseDetails, OpenEventDetail, OpenLocalityDetail, history) {
        
        this.CloseDetails = CloseDetails;
        this.OpenEventDetail = OpenEventDetail;
        this.OpenLocalityDetail = OpenLocalityDetail;

        this.history = history;
        this.NavigateToLast();
    }

    AddRecord = (type, id = null) => {

        let record = { type: type, id: id }
        if (this.RecordCanAdd(record)) {
            this.history.push(record);
            this.SaveHistory();
        }
    }

    RemoveLastRecord = () => {
        this.history.pop();
        this.SaveHistory();
    }

    RecordCanAdd = (newRecord) => {

        if (this.history.length < 1) {
            if (newRecord.type == "home")
                return false

            return true
        }

        return !(newRecord.id == this.RecordGetLast().id);
    }

    SaveHistory = () => {
        //COOKIE CHECK
        localStorage.setItem("history", JSON.stringify(this.history));
    }

    RecordGetLast = () => {

        if (this.history.length < 1)
            return { type: "home", id: null };

        return this.history[this.history.length - 1];
    }

    NavigateToLast = () => {
        let lastSite = this.RecordGetLast();
        this.HandleOpenSite(lastSite);
    }

    HandleOpenSite = (site) => {

        switch (site.type) {
            case "home":
                this.CloseDetails();
                break;
            case "event":
                this.OpenEventDetail(site.id);
                break;
            case "locality":
                this.OpenLocalityDetail(site.id, false);
                break;
            case "region":
                this.OpenLocalityDetail(site.id, true);
                break;
            default:
                this.CloseDetails();
        }
    }

    NavigateBack = () => {

        if (this.history.length <= 1) {
            this.history = [];
            this.SaveHistory();
            this.CloseDetails();
            return;
        }
            
        this.history.pop();
        let lastSite = this.history.pop();

        // is home
        if (lastSite.type == "home") {
            this.CloseDetails();
            return;
        }

        this.HandleOpenSite(lastSite);
    }
}

export default SiteHistory;