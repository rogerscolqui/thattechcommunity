import { api, LightningElement, track, wire } from 'lwc';
import getKnowledgeById from '@salesforce/apex/KnowledgeController.getKnowledgeById';

export default class KnowledgeArticleDetailPage extends LightningElement {
    @api
    recordId

    knowledgeRecord = {};

    // get title(){
    //     return this.knowledgeRecord.Title;
    // }

    @wire(getKnowledgeById, { kaId: '$recordId' })
    wiredGetKnowledgeById(value) {
        const { data, error } = value;

        if (data) { 
            let recordKnowledge = data;
            this.knowledgeRecord = {...recordKnowledge};
            console.log(this.knowledgeRecord);

        } else if (error) { 
            console.log(error);
        }
    }
}