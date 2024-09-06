import { LightningElement, track } from 'lwc';
import createKnowledgeArticle from "@salesforce/apex/KnowledgeController.createKnowledgeArticle";

export default class KnowledgeArticleForm extends LightningElement {

    @track kaTitle;
    @track kaUrlName;
    @track kaBannerImage;

    allowedFormats = [
        'image',
    ];

    handleChangeTitle(event){
        this.kaTitle = event.target.value;
    }

    handleChangeUrlName(event){
        this.kaUrlName = event.target.value;
    }

    handleChangeBannerImage(event){
        this.kaBannerImage = event.target.value;
    }

    handleCreateArticle(){
        if (this.kaTitle !== '' && this.kaUrlName !== '' && this.kaBannerImage !== '') {
            createKnowledgeArticle({
                title: this.kaTitle,
                urlName: this.kaUrlName,
                bannerImage: this.kaBannerImage
            })
            .then(result => {
                console.log(result);
            })
            .catch(error => {
                console.log(error);
            })
        }
        
    }
}