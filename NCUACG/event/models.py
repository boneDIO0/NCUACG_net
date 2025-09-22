# NCUACG/event/models.py
from __future__ import annotations

from django.db import models
from django.utils import timezone


class Event(models.Model):
    """
    校內/社團活動。預設依開始時間排序，並在 start_time 建索引，方便做「未來活動」查詢。
    """
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    location = models.CharField(max_length=200, blank=True)

    # 用於「只回傳未來活動」的核心欄位
    start_time = models.DateTimeField(db_index=True)
    end_time = models.DateTimeField(null=True, blank=True)

    # 追蹤用（可選）
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # 可見性（需要時可在前端/後端過濾）
    is_published = models.BooleanField(default=True)

    class Meta:
        ordering = ["start_time"]
        indexes = [
            models.Index(fields=["start_time"]),
            models.Index(fields=["is_published", "start_time"]),
        ]

    def __str__(self) -> str:
        return f"{self.title} @ {self.start_time.astimezone(timezone.get_current_timezone()).strftime('%Y-%m-%d %H:%M')}"

    @property
    def is_future(self) -> bool:
        """方便模板/序列化判斷此活動是否在未來。"""
        now = timezone.now()
        return self.start_time >= now
