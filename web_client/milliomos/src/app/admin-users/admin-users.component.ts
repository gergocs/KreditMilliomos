import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { QuestionService } from '../services/question.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserModell } from '../models/usermodell';

@Component({
  selector: 'app-admin',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss'],
})
export class AdminUsersComponent implements OnInit {
  loading = true;
  public userid: string | undefined;

  public hostname: string = 'localhost';

  userList: UserModell[] | undefined;
  helperListArray: boolean[] = new Array(1);
  bannedUserIDs: string[] | undefined;

  constructor(
    public router: Router,
    protected http: HttpClient,
    public questionService: QuestionService,
    public auth: AngularFireAuth,
    public authservice: AuthService,
    private modalService: NgbModal
  ) {}

  async ngOnInit() {
    await this.authservice.isAdmin().then(res => {
      if(res == false){
        this.router.navigate(['/main'])
        return
      }
    })

    this.loading = true;
    let userdatas = window.localStorage.getItem('userdatas');
    if (!userdatas) {
      this.authservice.logout();
      return;
    }

    await this.authservice
      .getAllUsers(JSON.parse(userdatas).tokenKey)
      .then(async (body) => {
        if (!body) return;

        this.userList = body;

        this.userList.forEach((u) => {
          u.name = decodeURIComponent(u.name);
          u.firstName = decodeURIComponent(u.firstName);
          u.lastName = decodeURIComponent(u.lastName);
          u.email = decodeURIComponent(u.email);
        });

        this.helperListArray = new Array(body.length);
        await this.authservice
          .bannedUserList()
          .then(async (body) => {
            if (body == null) {
              throw new Error();
            }

            this.bannedUserIDs = body;
          })
          .catch((error) => {
          });

        body.forEach((user, index) => {
          if (this.bannedUserIDs && this.helperListArray) {
            this.helperListArray[index] = this.bannedUserIDs?.includes(
              user.tokenKey
            );
          }
        });
        this.loading = false;
      })
      .catch((err) => {
        this.loading = false;
      });

    this.auth.onAuthStateChanged((credential) => {
      this.userid = credential?.uid;
    });
  }

  async banUser(tokenKey: string, disable: boolean, i: number) {
    let text =
      'Biztosan ' +
      (disable ? 'tiltani szeretnéd' : 'fel akarod oldani') +
      ' ezt a felhasználót?';
    await this.confirm(text, tokenKey)
      .then(async (confirmed) => {
        if (confirmed) {
          this.loading = true;
          if (this.userid) {
            let body = {
              isBan: disable,
              tokenkey: tokenKey,
            };
            let header = new HttpHeaders().set('tokenkey', this.userid);
            await this.http
              .put(
                (location.hostname == 'localhost'
                  ? 'http://localhost:8080/'
                  : 'https://kreditmilliomos.mooo.com:80/') + 'user/admin/ban',
                body,
                {
                  headers: header,
                  responseType: 'text',
                }
              )
              .toPromise()
              .then(async (body) => {
                if (body == null) {
                  throw new Error();
                }
                this.loading = false;
                this.helperListArray[i] = !this.helperListArray[i];
              })
              .catch((error) => {
                this.loading = false;
              });
          }
        }
      })
      .catch((error) => {
        return;
      });
  }

  public confirm(
    title: string,
    message: string,
    btnOkText: string = 'Igen',
    btnCancelText: string = 'Nem',
    dialogSize: 'sm' | 'lg' = 'lg'
  ): Promise<boolean> {
    const modalRef = this.modalService.open(ConfirmationDialogComponent, {
      size: dialogSize,
    });
    modalRef.componentInstance.title = title;
    modalRef.componentInstance.message = message;
    modalRef.componentInstance.btnOkText = btnOkText;
    modalRef.componentInstance.btnCancelText = btnCancelText;
    modalRef.componentInstance.size = 'lg';

    return modalRef.result;
  }
}
