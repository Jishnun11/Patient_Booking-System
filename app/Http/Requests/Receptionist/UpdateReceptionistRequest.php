<?php
// app/Http/Requests/Receptionist/UpdateReceptionistRequest.php

namespace App\Http\Requests\Receptionist;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateReceptionistRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        $receptionistId = $this->route('receptionist');

        return [
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'email',
                Rule::unique('receptionists', 'email')->ignore($receptionistId),
                Rule::unique('users', 'email')->ignore($receptionistId, 'id'),
            ],
            'password' => 'nullable|string|min:8|confirmed',
            'phone' => 'nullable|string|max:20',
            'shift' => 'required|in:morning,afternoon,night',
            'branch_id' => 'required|exists:branches,id',
            'is_active' => 'nullable|boolean',
        ];
    }

    public function messages()
    {
        return [
            'name.required' => 'Receptionist name is required',
            'email.required' => 'Email address is required',
            'email.unique' => 'This email is already registered',
            'password.min' => 'Password must be at least 8 characters',
            'password.confirmed' => 'Passwords do not match',
            'shift.required' => 'Please select a shift',
            'branch_id.required' => 'Please select a branch',
            'branch_id.exists' => 'Selected branch does not exist',
        ];
    }
}