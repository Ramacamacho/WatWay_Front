import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LogService } from '../../Servicios/log-service';

@Component({
  imports: [RouterLink,ReactiveFormsModule],
  selector: 'app-login-form',
  styleUrl: './login-form.css',
  templateUrl: './login-form.html',
})
export class LoginForm implements OnInit{
private fb  =inject(FormBuilder)
private service =inject(LogService)
private route =inject(ActivatedRoute)
private router = inject(Router)

 formulario! :FormGroup
 logid? :string

ngOnInit(): void {
  this.formulario = this.fb.group({
    emial:['',[Validators.required,Validators.maxLength(30)]],
        password:['',[Validators.required,Validators.maxLength(15)]],
  })
}

onSubmit():void{
  this.service.lala().subscribe({
    next:()=>
      this.router.navigate(['/']),
    error:()=>alert("usuario o contraseña incorrectos")
  });
}
}
