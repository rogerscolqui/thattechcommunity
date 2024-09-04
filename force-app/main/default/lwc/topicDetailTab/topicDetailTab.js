import { api, LightningElement, wire } from 'lwc';
import getKnowledgeRecords from "@salesforce/apex/KnowledgeController.getKnowledgeArticles";

export default class TopicDetailTab extends LightningElement {
    @api recordId;
    knowledgeArticles;

    @wire(getKnowledgeRecords, { topicId: '$recordId'})
    wiredGetKnowledgeRecords(value) {

        // this.wiredKnowledgeRecords = value;
        const { data, error } = value;

        if (data) { 

            let kaRecords = []

            data.forEach(ka => {
                kaRecords.push({...ka, urlName: `/s/article/${ka.UrlName}`})
            });

            this.knowledgeArticles = kaRecords
            console.log('wired data',this.knowledgeArticles)
        }
        else if (error) { 
            console.log('error', error)
        }
    }

    handleClickTest(){
        console.log("testing id");
        console.log(this.recordId);
    }


}