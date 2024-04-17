import { Component, OnInit } from '@angular/core';

// import { Post } from './posts/post.model';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  /** Commenting everything as it's redundant code now
    // storedPosts: Post[] = [];

    // onPostAdded(post: Post) {
    //   this.storedPosts.push(post);
    // }
  */

  constructor(private authService: AuthService) {}
  ngOnInit(): void {
    this.authService.autoAuthUser();
  }

}
