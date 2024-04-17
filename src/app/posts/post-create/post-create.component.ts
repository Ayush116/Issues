import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, ParamMap } from "@angular/router";

import { Post } from "../post.model";
import { PostService } from "../posts.service";
import { mimeType } from "./mime-type.validator";

@Component({
    // selector: 'app-post-create',
    styleUrl: './post-create.component.css',
    templateUrl: './post-create.component.html'
})
export class PostCreateComponent implements OnInit {

    enteredTitle = "";
    enteredContent = "";
    form!: FormGroup; // changes for Reactive-driven-approach
    imagePreview!: string;
    isLoading = false; // Added this to get the loading spinner
    post: Post = { id: '', title: '', content: '', imagePath: '', creator: '' };
    private mode = 'create';
    private postId = '';

    // ActivatedRoute helps in discerning which route to take. Helping in to check either 'edit' or 'save' version of post for the form-field. (re-using the same form-field-html code)
    constructor(public postService: PostService, public route: ActivatedRoute) {}

    // As ActivateRoute given as param in constructor and it's advised to keep constructor clean - so, enabling ngOnInit() for that logic
    ngOnInit() {
        this.form = new FormGroup({
            'title': new FormControl(null, {
                validators: [ Validators.required, Validators.minLength(4) ]
            }),
            'content': new FormControl(null, {
                validators: [ Validators.required ]
            }),
            'image': new FormControl(null, {
                validators: [ Validators.required ],
                asyncValidators: [ mimeType ]
            })
        });
        this.route.paramMap // paramMap is an Observable - so not need to unsubscribe
        .subscribe((paramMap: ParamMap) => {
            if (paramMap.has('postId')) {
                this.mode = 'edit';
                this.postId = paramMap.get('postId')!; // ! - means it will always be a string
                // Added subscribe() - because getPots() is changed to handle edit operations of post. So, getting Post[] from httpClient instead of local post[]
                this.isLoading = true;
                this.postService.getPost(this.postId).subscribe(postData => {
                    this.isLoading = false;
                    this.post = {
                        id: postData._id,
                        title: postData.title,
                        content: postData.content,
                        imagePath: postData.imagePath,
                        creator: postData.creator
                    };
                    // setValue() - allows to set all values within a form
                    this.form.setValue({
                        'title': this.post.title,
                        'content': this.post.content,
                        'image': this.post.imagePath
                    });
                });
            } else {
                this.mode = 'create';
                this.postId = '';
            }
        });
    }

    onImageUpload(event: Event) {
        // One approach 
            // const file = ((event.target as HTMLInputElement).files as FileList)[0];
        // Alternative approach
            const file = (event.target as HTMLInputElement).files![0]; // Here '!' is "Non-null assertion operator" which tells compiler that user know .files is never going to be 'null'. So, suppress the error.

        this.form.patchValue({ image: file }); // patchValue() - allows to control single value to add in a form
        this.form.get('image')?.updateValueAndValidity();

        { // image preview
            const reader = new FileReader();
            reader.onload = () => { // Async Code
                this.imagePreview = reader.result as string;
            };
            reader.readAsDataURL(file);
        }
    }

    onSavePost() {
        if (this.form.invalid) {
            return;
        }
        this.isLoading = true; // Never setting to false, as in both conditions we're moving out of this page. Also, it's initialize as false which means - no need to explicitly set it as 'false'
        if (this.mode === 'create') {
            this.postService.addPosts(
                this.form.value.title,
                this.form.value.content,
                this.form.value.image
            );
        } else if (this.mode === 'edit') {
            this.postService.updatePost(
                this.postId,
                this.form.value.title,
                this.form.value.content,
                this.form.value.image
            );
        }

        this.form.reset();
    }
}