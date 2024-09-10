import { api, LightningElement, track, wire } from 'lwc';

import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import basePath from '@salesforce/community/basePath';

import createKnowledgeArticle from "@salesforce/apex/KnowledgeController.createKnowledgeArticle";
import updateKnowledgeArticle from "@salesforce/apex/KnowledgeController.updateKnowledgeArticle";
import getAllFeaturedTopics from "@salesforce/apex/KnowledgeController.getAllFeaturedTopics";
import getTopicByKnowledgeId from "@salesforce/apex/KnowledgeController.getTopicByKnowledgeId";

export default class KnowledgeArticleForm extends LightningElement {

    @api updateRecord = false;

    @api kaId;
    @api kaArticleId;
    @api kaTitle;
    @api kaUrlName;
    @api kaBody;
    @api kaBannerImage;

    allowedFormats = [
        'image',
    ];

    @track isLoading = false;

    @track topicOptions;
    @track topicOptionValue;

    @wire(getTopicByKnowledgeId, { kaId: '$kaId' })
    wiredGetTopicByKnowledgeId(value) {
        // console.log('test');
        // this.wiredAllFeaturedTopics = value;    
        const { data, error } = value;

        if (data) { 

            this.topicOptionValue = data;

        } else if (error) { 
            console.log(error);
        }
    }

    @wire(getAllFeaturedTopics)
    wiredGetAllFeaturedTopics(value) {
        // console.log('test');
        // this.wiredAllFeaturedTopics = value;    
        const { data, error } = value;

        if (data) { 

            let recordList = [];

            data.forEach(topic => {
                recordList.push({
                    label: topic.Name, value: topic.Id
                })
            });

            this.topicOptionValue = recordList[0].value;
            this.topicOptions = recordList;

        } else if (error) { 
            console.log(error);
        }
    }

    handleChangeTopicOption(event) {
        this.topicOptionValue = event.detail.value;
    }

    handleChangeTitle(event){
        let titleValue = event.target.value
        this.kaTitle = titleValue;
        this.kaUrlName = titleValue.replace(/\s+/g, "-");
    }

    handleChangeUrlName(event){
        this.kaUrlName = event.target.value;
    }

    handleChangeBody(event){
        this.kaBody = event.target.value;
    }

    handleChangeBannerImage(event){
        this.kaBannerImage = event.target.value;
    }

    handleCreateArticle(){
        this.isLoading = true;
        if (this.kaTitle !== '' && this.kaUrlName !== '' && this.kaBody !== '' && this.kaBannerImage !== '' && this.topicOptionValue !== '') {
            createKnowledgeArticle({
                title: this.kaTitle,
                urlName: this.kaUrlName,
                body: this.kaBody,
                bannerImage: this.kaBannerImage,
                topicId: this.topicOptionValue,
                kaId: this.kaId
            })
            .then(result => {
                this.showNotificationCreated();
                window.clearTimeout(this.delayTimeout);
                // eslint-disable-next-line @lwc/lwc/no-async-operation
                this.delayTimeout = setTimeout(() => {
                    const curPageName = this.pageLightningRef();
                    const myArticlePage = curPageName + '/my-articles';
                    window.open(myArticlePage, "_self");
                }, 1500);
                console.log(result);
            })
            .catch(error => {
                this.isLoading = false
                console.log(error);
            })
        }
    }

    handleUpdateArticle(){
        this.isLoading = true;
        if (this.kaTitle !== '' && this.kaUrlName !== '' && this.kaBody !== '' && this.kaBannerImage !== '' && this.topicOptionValue !== '' && this.kaArticleId !== '') {
            updateKnowledgeArticle({
                title: this.kaTitle,
                urlName: this.kaUrlName,
                body: this.kaBody,
                bannerImage: this.kaBannerImage,
                topicId: this.topicOptionValue,
                kaId: this.kaArticleId
            })
            .then(result => {
                this.showNotificationCreated();
                window.clearTimeout(this.delayTimeout);
                // eslint-disable-next-line @lwc/lwc/no-async-operation
                this.delayTimeout = setTimeout(() => {
                    this.handleKnowledgeUpdated('finished')
                    this.isLoading = false
                }, 800);
                console.log(result);
            })
            .catch(error => {
                this.handleKnowledgeUpdated('error')
                this.isLoading = false
                console.log(error);
            })
        }
    }

    showNotificationCreated(){
        const event = new ShowToastEvent({
            title: 'Knowledge Article has been created.',
            variant: 'success'
        });
        this.dispatchEvent(event);
    }

    pageLightningRef(){
        // const before_ = `${basePath}`.substring(0, `${basePath}`.indexOf('/s')+1);
        const before_ = `${basePath}`;
        const communityUrl = `https://${location.host}${before_}`;
        return communityUrl;
    }

    handleKnowledgeUpdated(status){
        const evtM =  new CustomEvent("knowledgeupdated", {
            detail: {
                status: status
            }
        })
        this.dispatchEvent(evtM) 
    }
}