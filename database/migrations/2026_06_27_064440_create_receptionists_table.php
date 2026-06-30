<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('receptionists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('phone')->nullable();
            $table->foreignId('branch_id')->nullable()->constrained()->onDelete('set null');
            $table->string('shift')->nullable(); // morning, evening, night
            $table->boolean('status')->default(true); // true = active, false = inactive
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('receptionists');
    }
};